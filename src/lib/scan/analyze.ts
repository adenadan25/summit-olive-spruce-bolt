import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildReport, runPolicyEngine, worseVerdict } from "./engine";
import type {
  Finding,
  PolicyCategory,
  ScanForm,
  ScanReport,
  Severity,
  Verdict,
} from "./types";

const frameSchema = z.object({
  t: z.number().min(0).max(60 * 60 * 12),
  dataUrl: z.string().startsWith("data:image/").max(220_000),
});

const formSchema = z.object({
  title: z.string().max(200),
  description: z.string().max(5000),
  tags: z.string().max(500),
  category: z.string().max(80),
  audience: z.enum(["kids", "not-kids", "unsure"]),
  music: z.enum(["none", "original", "library", "yt-audio", "cover", "commercial", "unknown"]),
  footage: z.enum(["self", "collab", "stock", "game", "clips", "mixed", "unknown"]),
  hasThirdPartyClips: z.boolean(),
  hasProminentBrands: z.boolean(),
  childrenOnCamera: z.boolean(),
  monetize: z.boolean(),
  topics: z.array(
    z.enum(["violence", "weapons", "drugs", "adult", "politics", "tragedy", "medical", "profanity"]),
  ),
  youtubeUrl: z.string().max(300),
  notes: z.string().max(2000),
});

const inputSchema = z.object({
  mode: z.enum(["file", "url", "describe"]),
  form: formSchema,
  video: z
    .object({
      durationSec: z.number(),
      width: z.number(),
      height: z.number(),
      fileName: z.string().max(200),
      fileSize: z.number(),
    })
    .optional(),
  frames: z.array(frameSchema).max(5),
  sampleId: z.string().max(40).optional(),
});

const findingSchema = z.object({
  severity: z.enum(["info", "low", "medium", "high", "critical"]),
  category: z.enum(["copyright", "community", "advertiser", "kids", "monetization", "terms"]),
  title: z.string(),
  detail: z.string(),
  policyId: z.string(),
  fix: z.string(),
  frameIndex: z.number().int().optional(),
});

const aiSchema = z.object({
  summary: z.string(),
  findings: z.array(findingSchema).max(16),
  nextSteps: z.array(z.string()).max(8),
  fairUseNotes: z.string().optional(),
  contentIdLikelihood: z.enum(["low", "medium", "high"]).optional(),
  ageRestrictionLikelihood: z.enum(["low", "medium", "high"]).optional(),
});

type ChatContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

const SYSTEM_PROMPT = `You are a YouTube policy specialist preparing a pre-upload risk assessment.
You are not YouTube. You cannot run Content ID. You flag risk, not certainty.

Judge against current YouTube rules:
- Copyright / Content ID: claims vs strikes, music (recording + composition), movie/TV/sports/news clips, game publishers, fair use as a legal defense (not a YouTube toggle), reused content for YPP.
- Community Guidelines: spam/deceptive titles and thumbnails, nudity/sexual content, child safety, suicide/self-harm, harmful challenges, graphic violence, hate, harassment/doxxing, misinformation, firearms instructions.
- Advertiser-friendly: profanity in the open, violence, adult themes, drugs, shocking content, controversial issues, sensitive events, kids-directed ads.
- Made for Kids / COPPA.
- Terms: rights warranty, impersonation, realistic AI/synthetic disclosure.
- Monetization / YPP reused content.

When you see frames, look for: studio logos, famous characters, film/TV stills, sports broadcasts, brand marks, weapons, nudity, gore, children, hate symbols, news tickers, lyric/karaoke cards, watermarks from other platforms.

Be conservative. Prefer flagging a real risk over a false greenlight.
Never say a video is "definitely fair use" or "will not be claimed".
Distinguish: claim, strike/takedown, Community Guidelines removal, age restriction, limited ads, YPP reused-content denial.
Return ONLY JSON matching the schema. policyId must be one of:
- cr-ownership, cr-content-id, cr-music, cr-fair-use, cr-games, cr-reused, cr-repeat,
- cg-spam, cg-thumbnails, cg-nudity, cg-child-safety, cg-harm, cg-violence, cg-hate, cg-harassment, cg-misinfo, cg-firearms, cg-self-harm, cg-inauthentic, cg-animals, cg-cyber,
- ad-friendly, ad-language, ad-sensitive-events, kids-coppa, tos-rights, tos-impersonation, tos-ai, ypp-thresholds.
If nothing visual is wrong, return an empty findings array and a short summary.`;

function formBrief(form: ScanForm): string {
  return [
    `Title: ${form.title || "(none)"}`,
    `Description: ${form.description || "(none)"}`,
    `Tags: ${form.tags || "(none)"}`,
    `Category: ${form.category}`,
    `Audience: ${form.audience}`,
    `Music: ${form.music}`,
    `Footage: ${form.footage}`,
    `Third-party clips: ${form.hasThirdPartyClips}`,
    `Prominent brands/logos: ${form.hasProminentBrands}`,
    `Children on camera: ${form.childrenOnCamera}`,
    `Plans to monetize: ${form.monetize}`,
    `Sensitive topics: ${form.topics.join(", ") || "none flagged"}`,
    `YouTube URL: ${form.youtubeUrl || "(none)"}`,
    `Notes: ${form.notes || "(none)"}`,
  ].join("\n");
}

function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence?.[1] ?? trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Model did not return JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

async function fetchYoutubeMeta(url: string): Promise<{
  title: string;
  author: string;
  thumbnailDataUrl: string | null;
} | null> {
  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembed, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    thumbnail_url?: string;
    title?: string;
    author_name?: string;
  };
  let thumbnailDataUrl: string | null = null;
  if (body.thumbnail_url) {
    try {
      const img = await fetch(body.thumbnail_url);
      if (img.ok) {
        const buf = Buffer.from(await img.arrayBuffer());
        if (buf.byteLength <= 1_500_000) {
          thumbnailDataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`;
        }
      }
    } catch {
      /* thumbnail is best-effort */
    }
  }
  return {
    title: body.title ?? "",
    author: body.author_name ?? "",
    thumbnailDataUrl,
  };
}

export const lookupYoutube = createServerFn({ method: "POST" })
  .validator((raw: unknown) => z.object({ url: z.string().max(300) }).parse(raw))
  .handler(async ({ data }) => {
    const meta = await fetchYoutubeMeta(data.url);
    if (!meta) return null;
    return { title: meta.title, author: meta.author };
  });

async function callGrok(content: ChatContent[], attempt = 0): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("AI is not available");

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.2,
      max_tokens: 2200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
    }),
  });

  if (!res.ok) {
    if (attempt === 0 && res.status >= 500) return callGrok(content, 1);
    const errText = await res.text().catch(() => "");
    throw new Error(`xAI API error ${res.status}${errText ? `: ${errText.slice(0, 180)}` : ""}`);
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return body.choices?.[0]?.message?.content ?? "";
}

function mergeFindings(engine: Finding[], ai: Finding[]): Finding[] {
  const seen = new Set<string>();
  const out: Finding[] = [];
  const push = (f: Finding) => {
    const key = `${f.policyId}:${f.title.toLowerCase().slice(0, 48)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(f);
  };
  for (const f of engine) push(f);
  for (const f of ai) {
    push({
      ...f,
      id: `ai-${f.policyId}-${out.length}`,
    });
  }
  const rank: Record<Severity, number> = {
    info: 0,
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return out.sort((a, b) => rank[b.severity] - rank[a.severity]);
}

export const analyzeUpload = createServerFn({ method: "POST" })
  .validator((raw: unknown) => inputSchema.parse(raw))
  .handler(async ({ data }): Promise<ScanReport> => {
    const frames = data.frames.slice(0, 5);
    let form = data.form;
    let extraFrames = frames;
    let sourceLabel =
      data.mode === "url"
        ? data.form.youtubeUrl || "YouTube URL"
        : data.video?.fileName || data.sampleId || "Policy check";
    let youtubeListing: ScanReport["youtubeListing"];

    if (data.mode === "url" && data.form.youtubeUrl) {
      try {
        const meta = await fetchYoutubeMeta(data.form.youtubeUrl);
        if (meta) {
          youtubeListing = { title: meta.title, author: meta.author };
          if (!form.title.trim() && meta.title) {
            form = { ...form, title: meta.title };
          }
          if (extraFrames.length === 0 && meta.thumbnailDataUrl) {
            extraFrames = [{ t: 0, dataUrl: meta.thumbnailDataUrl }];
          }
          if (meta.author) {
            sourceLabel = meta.author;
          }
        }
      } catch {
        /* oEmbed is best-effort */
      }
    }

    const engineFindings = runPolicyEngine(form, data.video);

    const apiKey = process.env.XAI_API_KEY;
    let aiUsed = false;
    let aiError: string | undefined;
    let aiFindings: Finding[] = [];
    let summary: string | undefined;
    let nextSteps: string[] | undefined;
    let fairUseNotes: string | undefined;

    if (!apiKey) {
      aiError = "Visual AI is not available in this environment. This report is the policy engine only.";
    } else {
      try {
        const listingLine = youtubeListing
          ? `Public YouTube listing: "${youtubeListing.title}" by ${youtubeListing.author || "unknown channel"}.\n`
          : "";
        const content: ChatContent[] = [
          {
            type: "text",
            text:
              `Assess this planned YouTube upload.\n\n${formBrief(form)}\n\n` +
              listingLine +
              (data.video
                ? `File: ${data.video.fileName}, ${data.video.width}×${data.video.height}, ${data.video.durationSec.toFixed(1)}s, ${(data.video.fileSize / 1_000_000).toFixed(1)} MB.\n`
                : "") +
              (extraFrames.length
                ? `${extraFrames.length} frame(s) follow, in timeline order. Comment on a frameIndex (0-based) when a finding is visual.\n`
                : "No frames attached — judge from the creator's answers only.\n") +
              `Return JSON: {"summary": string, "findings": [{"severity":"info|low|medium|high|critical","category":"copyright|community|advertiser|kids|monetization|terms","title":string,"detail":string,"policyId":string,"fix":string,"frameIndex":number?}], "nextSteps": string[], "fairUseNotes": string, "contentIdLikelihood":"low|medium|high", "ageRestrictionLikelihood":"low|medium|high"}`,
          },
        ];
        extraFrames.forEach((frame, i) => {
          content.push({ type: "text", text: `Frame ${i} at ${frame.t.toFixed(1)}s` });
          content.push({ type: "image_url", image_url: { url: frame.dataUrl } });
        });

        const raw = await callGrok(content);
        const parsed = aiSchema.safeParse(parseJsonObject(raw));
        if (parsed.success) {
          aiUsed = true;
          summary = parsed.data.summary;
          nextSteps = parsed.data.nextSteps;
          fairUseNotes = parsed.data.fairUseNotes;
          aiFindings = parsed.data.findings.map((f, i) => ({
            id: `ai-${i}`,
            severity: f.severity as Severity,
            category: f.category as PolicyCategory,
            title: f.title,
            detail: f.detail,
            policyId: f.policyId,
            fix: f.fix,
            frameIndex: f.frameIndex,
          }));
        } else {
          aiError = "The visual review returned an unexpected shape. Policy checks still ran.";
        }
      } catch (err) {
        aiError = err instanceof Error ? err.message : "Visual review failed";
      }
    }

    const findings = mergeFindings(engineFindings, aiFindings);
    const report = buildReport({
      form,
      video: data.video,
      findings,
      summary,
      nextSteps,
      fairUseNotes,
      aiUsed,
      aiError,
      thumbDataUrl: extraFrames[0]?.dataUrl,
      sourceLabel,
      youtubeListing,
    });

    if (aiUsed && aiFindings.length) {
      const aiWorst = aiFindings.some((f) => f.severity === "critical")
        ? "hold"
        : aiFindings.some((f) => f.severity === "high")
          ? "caution"
          : report.verdict;
      report.verdict = worseVerdict(report.verdict, aiWorst as Verdict);
    }

    return report;
  });
