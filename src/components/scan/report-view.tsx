import { ArrowLeft, CircleAlert, Clapperboard, Copy, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignalLamp, verdictBadgeVariant, verdictLabel } from "@/components/signal-lamp";
import { CATEGORY_LABEL, policyById } from "@/lib/scan/policies";
import type { Finding, FrameSample, PolicyCategory, ScanReport, Severity } from "@/lib/scan/types";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: PolicyCategory[] = [
  "copyright",
  "community",
  "advertiser",
  "kids",
  "monetization",
  "terms",
];

function severityVariant(s: Severity): "go" | "hold" | "stop" | "default" {
  if (s === "critical" || s === "high") return "stop";
  if (s === "medium") return "hold";
  if (s === "low") return "default";
  return "go";
}

function safetyLine(verdict: ScanReport["verdict"]) {
  if (verdict === "green") return "Safe to upload, with ordinary care.";
  if (verdict === "caution") return "You can upload — expect claims, limited ads, or extra review.";
  return "Do not upload this as it stands.";
}
  const ads =
    report.monetizationOutlook === "full"
      ? "Full ads possible"
      : report.monetizationOutlook === "limited"
        ? "Limited ads likely"
        : report.monetizationOutlook === "ineligible"
          ? "Not eligible"
          : "No ads / not monetizing";
  const cid =
    report.contentIdLikelihood === "high"
      ? "Content ID match likely"
      : report.contentIdLikelihood === "medium"
        ? "Content ID possible"
        : "Low Content ID signal";
  const age =
    report.ageRestrictionLikelihood === "high"
      ? "Age restriction likely"
      : report.ageRestrictionLikelihood === "medium"
        ? "Age restriction possible"
        : "Unlikely age-restricted";
  return { ads, cid, age };
}

function reportText(report: ScanReport) {
  const lines = [
    `Greenlight — ${verdictLabel(report.verdict).toUpperCase()}  (${report.score}/100)`,
    report.summary,
    "",
    ...report.findings.map(
      (f) => `[${f.severity}] ${f.title}\n${f.detail}\nFix: ${f.fix}\n`,
    ),
    "Next steps:",
    ...report.nextSteps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Not affiliated with YouTube. Not legal advice. Not a Content ID scan.",
  ];
  return lines.join("\n");
}

export function ReportView({
  report,
  frames,
  onReset,
}: {
  report: ScanReport;
  frames: FrameSample[];
  onReset: () => void;
}) {
  const outlook = outlookLabel(report);
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: report.findings.filter((f) => f.category === cat),
  })).filter((g) => g.items.length > 0);

  async function copyReport() {
    await navigator.clipboard.writeText(reportText(report));
  }

  function downloadReport() {
    const blob = new Blob([reportText(report)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `greenlight-${report.verdict}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onReset} className="px-2">
          <ArrowLeft />
          New scan
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyReport}>
            <Copy />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadReport}>
            <Download />
            Save
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[var(--radius-xl)] bg-card p-6 shadow-[var(--shadow-border)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <SignalLamp verdict={report.verdict} size="lg" />
            <h2 className="font-display text-5xl tracking-tight italic sm:text-6xl">
              {verdictLabel(report.verdict)}
            </h2>
            <p className="text-sm font-medium text-foreground">{safetyLine(report.verdict)}</p>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
            {report.youtubeListing?.title ? (
              <p className="text-xs text-subtle">
                Public listing · {report.youtubeListing.title}
                {report.youtubeListing.author ? ` · ${report.youtubeListing.author}` : ""}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-subtle">Clearance</p>
            <p className="font-display text-6xl tabular-nums tracking-tight">{report.score}</p>
            <p className="text-xs text-subtle">of 100</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[outlook.cid, outlook.ads, outlook.age].map((label) => (
            <div
              key={label}
              className="rounded-[var(--radius-md)] bg-elevated px-4 py-3 text-sm text-foreground shadow-[var(--shadow-border)]"
            >
              {label}
            </div>
          ))}
        </div>

        {report.aiError ? (
          <p className="mt-4 text-xs text-hold">{report.aiError}</p>
        ) : report.aiUsed ? (
          <p className="mt-4 text-xs text-subtle">Visual review of sampled frames is included.</p>
        ) : (
          <p className="mt-4 text-xs text-subtle">Policy engine only — no frames were reviewed.</p>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_ORDER.map((cat) => {
          const slice = report.categories[cat];
          return (
            <div
              key={cat}
              className="rounded-[var(--radius-lg)] bg-card p-4 shadow-[var(--shadow-border)]"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{CATEGORY_LABEL[cat]}</p>
                <Badge variant={verdictBadgeVariant(slice.verdict)}>{slice.score}</Badge>
              </div>
              <div className="mb-2 h-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className={cn(
                    "h-full",
                    slice.verdict === "green"
                      ? "bg-go"
                      : slice.verdict === "caution"
                        ? "bg-hold"
                        : "bg-stop",
                  )}
                  style={{ width: `${slice.score}%` }}
                />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{slice.note}</p>
            </div>
          );
        })}
      </section>

      {frames.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Clapperboard className="size-4" />
            Sampled frames
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {frames.map((frame, i) => {
              const hits = report.findings.filter((f) => f.frameIndex === i);
              return (
                <figure key={`${frame.t}-${i}`} className="w-36 shrink-0">
                  <img
                    src={frame.dataUrl}
                    alt={`Frame at ${frame.t.toFixed(1)} seconds`}
                    className="aspect-video w-full rounded-[var(--radius-sm)] object-cover outline outline-1 -outline-offset-1 outline-white/10"
                  />
                  <figcaption className="mt-1.5 text-[11px] text-subtle">
                    {frame.t.toFixed(1)}s
                    {hits.length > 0 ? ` · ${hits.length} flag${hits.length === 1 ? "" : "s"}` : ""}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="rounded-[var(--radius-xl)] bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h3 className="mb-1 text-sm font-medium">Findings</h3>
        <p className="mb-4 text-xs text-subtle">
          {report.findings.length === 0
            ? "Nothing material from the answers or frames."
            : `${report.findings.length} item${report.findings.length === 1 ? "" : "s"} across YouTube rules.`}
        </p>
        <div className="space-y-8">
          {grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground">No policy flags. Still keep license proofs at upload.</p>
          ) : (
            grouped.map((group) => (
              <div key={group.cat}>
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-subtle">
                  {CATEGORY_LABEL[group.cat]}
                </p>
                <ul className="space-y-3">
                  {group.items.map((f) => (
                    <FindingCard key={f.id} finding={f} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h3 className="mb-4 text-sm font-medium">Before you upload</h3>
          <ol className="space-y-3">
            {report.nextSteps.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs tabular-nums text-foreground">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-[var(--radius-xl)] bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h3 className="mb-4 text-sm font-medium">Fair use</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{report.fairUseNotes}</p>
        </div>
      </section>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const policy = policyById(finding.policyId);
  return (
    <li className="rounded-[var(--radius-md)] bg-elevated p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <CircleAlert
            className={cn(
              "mt-0.5 size-4 shrink-0",
              finding.severity === "critical" || finding.severity === "high"
                ? "text-stop"
                : finding.severity === "medium"
                  ? "text-hold"
                  : "text-muted-foreground",
            )}
          />
          <div>
            <p className="text-sm font-medium text-foreground">{finding.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{finding.detail}</p>
          </div>
        </div>
        <Badge variant={severityVariant(finding.severity)}>{finding.severity}</Badge>
      </div>
      <Separator className="my-3" />
      <p className="text-sm text-foreground">
        <span className="text-subtle">Fix · </span>
        {finding.fix}
      </p>
      {policy ? (
        <a
          href={policy.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex min-h-11 items-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {policy.sourceLabel}
        </a>
      ) : null}
    </li>
  );
}
