import type { FrameSample, VideoMeta } from "./types";

function once(video: HTMLVideoElement, event: string, timeoutMs = 12000) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timed out reading the video. Try a shorter MP4 or WebM."));
    }, timeoutMs);
    const onErr = () => {
      cleanup();
      reject(
        new Error(
          "This browser could not decode the file. Export an H.264 MP4 or VP9 WebM and try again.",
        ),
      );
    };
    const onOk = () => {
      cleanup();
      resolve();
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener(event, onOk);
      video.removeEventListener("error", onErr);
    };
    video.addEventListener(event, onOk, { once: true });
    video.addEventListener("error", onErr, { once: true });
  });
}

function sampleTimes(duration: number, count: number): number[] {
  if (!Number.isFinite(duration) || duration <= 0) return [0];
  const n = Math.max(1, count);
  const start = Math.min(0.12, duration * 0.02);
  const end = Math.max(start, duration - Math.min(0.35, duration * 0.04));
  if (n === 1) return [start];
  return Array.from({ length: n }, (_, i) => start + ((end - start) * i) / (n - 1));
}

export interface ExtractResult {
  video: VideoMeta;
  frames: FrameSample[];
}

export async function extractFrames(
  file: File,
  count = 5,
  onProgress?: (label: string) => void,
): Promise<ExtractResult> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  video.src = url;

  try {
    onProgress?.("Reading container");
    await once(video, "loadedmetadata");
    if (video.readyState < 2) {
      try {
        await video.play();
        video.pause();
      } catch {
        /* autoplay may be blocked; seeking still works after metadata */
      }
    }

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const width = video.videoWidth || 0;
    const height = video.videoHeight || 0;
    const times = sampleTimes(duration, count);
    const frames: FrameSample[] = [];
    const canvas = document.createElement("canvas");
    const maxW = 512;
    const w = Math.min(maxW, width || maxW);
    const h = Math.max(1, Math.round(((height || 9) / (width || 16)) * w));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create a drawing surface for frames.");

    for (let i = 0; i < times.length; i++) {
      const t = times[i] ?? 0;
      onProgress?.(`Sampling frame ${i + 1} of ${times.length}`);
      video.currentTime = t;
      await once(video, "seeked", 8000);
      ctx.drawImage(video, 0, 0, w, h);
      let dataUrl = canvas.toDataURL("image/jpeg", 0.62);
      if (dataUrl.length > 180_000) {
        dataUrl = canvas.toDataURL("image/jpeg", 0.45);
      }
      frames.push({ t, dataUrl });
    }

    return {
      video: {
        durationSec: duration,
        width,
        height,
        fileName: file.name,
        fileSize: file.size,
      },
      frames,
    };
  } finally {
    video.src = "";
    URL.revokeObjectURL(url);
  }
}

export function parseYoutubeId(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.searchParams.get("v") && /^[\w-]{11}$/.test(url.searchParams.get("v") ?? "")) {
        return url.searchParams.get("v");
      }
      const parts = url.pathname.split("/").filter(Boolean);
      if ((parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") && parts[1]) {
        return /^[\w-]{11}$/.test(parts[1]) ? parts[1] : null;
      }
    }
  } catch {
    if (/^[\w-]{11}$/.test(value)) return value;
  }
  return null;
}
