import { useMemo, useRef, useState, type ReactNode } from "react";
import { Film, Link2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ReportView } from "@/components/scan/report-view";
import { SignalLamp, verdictBadgeVariant, verdictLabel } from "@/components/signal-lamp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analyzeUpload } from "@/lib/scan/analyze";
import { runPolicyEngine } from "@/lib/scan/engine";
import { extractFrames, parseYoutubeId } from "@/lib/scan/extract";
import { loadHistory, saveReport, type HistoryItem } from "@/lib/scan/history";
import { SAMPLES } from "@/lib/scan/samples";
import {
  EMPTY_FORM,
  YT_CATEGORIES,
  type FrameSample,
  type ScanForm,
  type ScanMode,
  type ScanReport,
  type SensitiveTopic,
  type VideoMeta,
} from "@/lib/scan/types";
import { cn } from "@/lib/utils";

const TOPICS: { id: SensitiveTopic; label: string }[] = [
  { id: "profanity", label: "Profanity" },
  { id: "violence", label: "Violence" },
  { id: "weapons", label: "Weapons" },
  { id: "adult", label: "Adult / sexual" },
  { id: "drugs", label: "Drugs" },
  { id: "politics", label: "Politics" },
  { id: "tragedy", label: "Tragedy / news" },
  { id: "medical", label: "Medical claims" },
];

const MUSIC: { id: ScanForm["music"]; label: string }[] = [
  { id: "none", label: "No music" },
  { id: "original", label: "Original" },
  { id: "yt-audio", label: "YT Audio Library" },
  { id: "library", label: "Paid library" },
  { id: "cover", label: "Cover song" },
  { id: "commercial", label: "Commercial track" },
  { id: "unknown", label: "Not sure" },
];

const FOOTAGE: { id: ScanForm["footage"]; label: string }[] = [
  { id: "self", label: "I filmed it" },
  { id: "collab", label: "Collaborators" },
  { id: "stock", label: "Licensed stock" },
  { id: "game", label: "Game capture" },
  { id: "clips", label: "Movie / TV / sports" },
  { id: "mixed", label: "Mixed" },
  { id: "unknown", label: "Not sure" },
];

const STEPS = [
  "Listing copy",
  "Copyright & Content ID",
  "Community Guidelines",
  "Advertiser-friendly",
  "Child safety / COPPA",
  "Terms of Service",
  "Compiling verdict",
];

type Phase = "idle" | "prep" | "analyze" | "done";

export function Studio() {
  const [form, setForm] = useState<ScanForm>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [video, setVideo] = useState<VideoMeta | undefined>();
  const [frames, setFrames] = useState<FrameSample[]>([]);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepLabel, setStepLabel] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    typeof window === "undefined" ? [] : loadHistory(),
  );
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const liveFindings = useMemo(() => runPolicyEngine(form, video), [form, video]);
  const liveHigh = liveFindings.filter((f) => f.severity === "high" || f.severity === "critical");

  function patch<K extends keyof ScanForm>(key: K, value: ScanForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetAll() {
    setForm(EMPTY_FORM);
    setFile(null);
    setVideo(undefined);
    setFrames([]);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    setPhase("idle");
    setReport(null);
    setStepIndex(0);
    setStepLabel("");
  }

  async function onFile(next: File | null) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setFile(next);
    setFrames([]);
    setVideo(undefined);
    if (!next) {
      setObjectUrl(null);
      return;
    }
    if (!next.type.startsWith("video/") && !/\.(mp4|webm|mov|m4v|mkv)$/i.test(next.name)) {
      toast.error("Use a video file (MP4 or WebM works best).");
      setFile(null);
      return;
    }
    const url = URL.createObjectURL(next);
    setObjectUrl(url);
    setPhase("prep");
    setStepLabel("Sampling frames");
    try {
      const extracted = await extractFrames(next, 5, (label) => setStepLabel(label));
      setVideo(extracted.video);
      setFrames(extracted.frames);
      setPhase("idle");
      setStepLabel("");
    } catch (err) {
      setPhase("idle");
      toast.error(err instanceof Error ? err.message : "Could not read that video.");
    }
  }

  async function run(mode: ScanMode, sampleId?: string) {
    if (phase === "prep" || phase === "analyze") return;
    const ytId = parseYoutubeId(form.youtubeUrl);
    if (mode === "url" && form.youtubeUrl && !ytId) {
      toast.error("That does not look like a YouTube link.");
      return;
    }
    setPhase("analyze");
    setStepIndex(0);
    setStepLabel(STEPS[0] ?? "Checking");
    let tick = 0;
    const timer = window.setInterval(() => {
      tick = Math.min(STEPS.length - 1, tick + 1);
      setStepIndex(tick);
      setStepLabel(STEPS[tick] ?? "Checking");
    }, 700);

    try {
      const result = await analyzeUpload({
        data: {
          mode,
          form,
          video,
          frames: frames.filter((f) => f.dataUrl.length <= 210_000),
          sampleId,
        },
      });
      window.clearInterval(timer);
      setReport(result);
      setPhase("done");
      setHistory(saveReport(result));
    } catch (err) {
      window.clearInterval(timer);
      setPhase("idle");
      toast.error(err instanceof Error ? err.message : "Scan failed. Try again.");
    }
  }

  function applySample(id: string) {
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setForm(sample.form);
    setFile(null);
    setVideo(undefined);
    setFrames([]);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    void run("describe", sample.id);
  }

  if (phase === "done" && report) {
    return (
      <ReportView
        report={report}
        frames={frames}
        onReset={resetAll}
      />
    );
  }

  return (
    <div className="space-y-10">
      <section className="max-w-2xl space-y-4">
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Pre-flight for YouTube</p>
        <h1 className="font-display text-4xl leading-[1.1] tracking-tight sm:text-6xl">
          Know if it is safe to upload — before you hit publish.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          Greenlight checks your video and listing against YouTube copyright, Community Guidelines,
          advertiser rules, child safety, and the Terms of Service.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const dropped = e.dataTransfer.files[0];
              if (dropped) void onFile(dropped);
            }}
            className={cn(
              "relative overflow-hidden rounded-[var(--radius-xl)] bg-card p-2 shadow-[var(--shadow-border)]",
              dragOver && "shadow-[var(--shadow-border-hover)]",
            )}
          >
            {objectUrl ? (
              <div className="space-y-2">
                <video
                  src={objectUrl}
                  controls
                  className="aspect-video w-full rounded-[calc(var(--radius-xl)-8px)] bg-background object-contain"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1 text-xs text-subtle">
                  <span>
                    {file?.name}
                    {video
                      ? ` · ${video.width}×${video.height} · ${Math.round(video.durationSec)}s`
                      : ""}
                  </span>
                  <button
                    type="button"
                    className="min-h-11 text-muted-foreground hover:text-foreground"
                    onClick={() => void onFile(null)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-[calc(var(--radius-xl)-8px)] bg-elevated px-6 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-card shadow-[var(--shadow-border)]">
                  <Upload className="size-5" />
                </span>
                <span className="text-sm font-medium">Drop a video, or browse</span>
                <span className="max-w-xs text-xs leading-relaxed text-subtle">
                  Frames stay in this browser until you run a scan. MP4 and WebM decode most reliably.
                </span>
              </button>
            )}
            {phase === "prep" ? (
              <div className="absolute inset-2 flex items-end rounded-[calc(var(--radius-xl)-8px)] bg-background/55 p-4">
                <p className="shimmer-text text-sm">{stepLabel}</p>
              </div>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {frames.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto">
              {frames.map((frame, i) => (
                <img
                  key={`${frame.t}-${i}`}
                  src={frame.dataUrl}
                  alt=""
                  className="h-16 w-28 shrink-0 rounded-[var(--radius-sm)] object-cover outline outline-1 -outline-offset-1 outline-white/10"
                />
              ))}
            </div>
          ) : null}

          <div className="rounded-[var(--radius-xl)] bg-card p-4 shadow-[var(--shadow-border)]">
            <Label htmlFor="yt">Or paste a YouTube URL</Label>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                <Input
                  id="yt"
                  className="pl-9"
                  placeholder="https://www.youtube.com/watch?v=…"
                  value={form.youtubeUrl}
                  onChange={(e) => patch("youtubeUrl", e.target.value)}
                />
              </div>
              <Button
                variant="secondary"
                disabled={phase !== "idle" || !form.youtubeUrl}
                onClick={() => void run("url")}
              >
                Check URL
              </Button>
            </div>
            <p className="mt-2 text-xs text-subtle">
              Reads public title and thumbnail only. It cannot download the video or run Content ID.
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">Clearance sheet</h2>
              <p className="text-xs text-subtle">Honest answers beat a pretty file.</p>
            </div>
            {liveHigh.length > 0 ? (
              <Badge variant="stop">{liveHigh.length} high-risk</Badge>
            ) : liveFindings.length > 0 ? (
              <Badge>{liveFindings.length} signals</Badge>
            ) : null}
          </div>

          <div className="space-y-5">
            <Field label="Planned title" htmlFor="title">
              <Input
                id="title"
                value={form.title}
                maxLength={100}
                placeholder="What will the upload be called?"
                onChange={(e) => patch("title", e.target.value)}
              />
            </Field>
            <Field label="Description" htmlFor="desc">
              <Textarea
                id="desc"
                value={form.description}
                placeholder="Paste the description draft, including credits."
                onChange={(e) => patch("description", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tags" htmlFor="tags">
                <Input
                  id="tags"
                  value={form.tags}
                  placeholder="comma, separated"
                  onChange={(e) => patch("tags", e.target.value)}
                />
              </Field>
              <Field label="Category" htmlFor="cat">
                <select
                  id="cat"
                  value={form.category}
                  onChange={(e) => patch("category", e.target.value)}
                  className="flex h-11 w-full rounded-[var(--radius-sm)] bg-elevated px-3 text-sm text-foreground shadow-[var(--shadow-border)] outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                >
                  {YT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
                Music
              </legend>
              <ChipGroup>
                {MUSIC.map((m) => (
                  <Chip
                    key={m.id}
                    active={form.music === m.id}
                    onClick={() => patch("music", m.id)}
                  >
                    {m.label}
                  </Chip>
                ))}
              </ChipGroup>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
                Footage
              </legend>
              <ChipGroup>
                {FOOTAGE.map((m) => (
                  <Chip
                    key={m.id}
                    active={form.footage === m.id}
                    onClick={() => patch("footage", m.id)}
                  >
                    {m.label}
                  </Chip>
                ))}
              </ChipGroup>
            </fieldset>

            <div className="grid gap-3">
              <ToggleRow
                label="Includes movie, TV, sports, or news clips"
                checked={form.hasThirdPartyClips}
                onChange={(v) => patch("hasThirdPartyClips", v)}
              />
              <ToggleRow
                label="Prominent logos or other brands in frame"
                checked={form.hasProminentBrands}
                onChange={(v) => patch("hasProminentBrands", v)}
              />
              <ToggleRow
                label="Children appear on camera"
                checked={form.childrenOnCamera}
                onChange={(v) => patch("childrenOnCamera", v)}
              />
              <ToggleRow
                label="I want to monetize this"
                checked={form.monetize}
                onChange={(v) => patch("monetize", v)}
              />
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
                Audience
              </legend>
              <ChipGroup>
                {(
                  [
                    ["not-kids", "Not for kids"],
                    ["kids", "Made for kids"],
                    ["unsure", "Not sure"],
                  ] as const
                ).map(([id, label]) => (
                  <Chip key={id} active={form.audience === id} onClick={() => patch("audience", id)}>
                    {label}
                  </Chip>
                ))}
              </ChipGroup>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
                Topics in the video
              </legend>
              <ChipGroup>
                {TOPICS.map((t) => {
                  const on = form.topics.includes(t.id);
                  return (
                    <Chip
                      key={t.id}
                      active={on}
                      onClick={() =>
                        patch(
                          "topics",
                          on ? form.topics.filter((x) => x !== t.id) : [...form.topics, t.id],
                        )
                      }
                    >
                      {t.label}
                    </Chip>
                  );
                })}
              </ChipGroup>
            </fieldset>

            <Field label="Anything else we should know" htmlFor="notes">
              <Textarea
                id="notes"
                className="min-h-20"
                value={form.notes}
                placeholder="Licenses on file, who appears, AI tools used…"
                onChange={(e) => patch("notes", e.target.value)}
              />
            </Field>

            <Button
              className="w-full"
              size="lg"
              disabled={phase !== "idle"}
              onClick={() => void run(file ? "file" : form.youtubeUrl ? "url" : "describe")}
            >
              {phase === "analyze" ? (
                <>
                  <Loader2 className="animate-spin" />
                  Running pre-flight
                </>
              ) : (
                <>Run pre-flight</>
              )}
            </Button>
            {phase === "analyze" ? (
              <p className="text-center text-xs text-subtle">{stepLabel}</p>
            ) : (
              <p className="text-center text-xs text-subtle">
                Uses your answers{frames.length ? ", sampled frames," : ""} and YouTube’s published rules.
              </p>
            )}
          </div>
        </div>
      </div>

      {phase === "analyze" ? (
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={cn(
                "rounded-[var(--radius-md)] bg-card px-3 py-3 text-xs shadow-[var(--shadow-border)]",
                i <= stepIndex ? "text-foreground" : "text-subtle",
              )}
            >
              <span className="tabular-nums text-subtle">{String(i + 1).padStart(2, "0")} · </span>
              {s}
            </li>
          ))}
        </ol>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-medium">Try a known scenario</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => applySample(s.id)}
              disabled={phase !== "idle"}
              className="rounded-[var(--radius-lg)] bg-card p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)] disabled:opacity-50"
            >
              <Film className="mb-3 size-4 text-subtle" />
              <p className="text-sm font-medium">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      {history.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-medium">Recent pre-flights</h2>
          <ul className="divide-y divide-border rounded-[var(--radius-lg)] bg-card shadow-[var(--shadow-border)]">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  onClick={() => {
                    setReport(item.report);
                    setForm(item.report.form);
                    setPhase("done");
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{item.title}</span>
                    <span className="text-xs text-subtle">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <SignalLamp verdict={item.verdict} size="sm" />
                    <Badge variant={verdictBadgeVariant(item.verdict)}>
                      {verdictLabel(item.verdict)} · {item.score}
                    </Badge>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function ChipGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full px-3 text-sm transition-[background-color,color] duration-[var(--motion-quick)]",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-elevated text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-primary"
      />
    </label>
  );
}
