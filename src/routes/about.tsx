import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({ component: AboutPage });

const STEPS = [
  {
    title: "You describe the upload",
    body: "Title, music source, who shot it, whether kids appear, and the topics in the video. Most takedowns start with something the creator already knew and hoped would slide.",
  },
  {
    title: "We sample the picture",
    body: "If you drop a file, frames are taken in this browser and sent only when you run a scan. A YouTube link uses the public thumbnail. Nothing is stored on a server after the response.",
  },
  {
    title: "Rules, then a second look",
    body: "A policy engine maps your answers onto YouTube’s published copyright, Community Guidelines, advertiser, kids, YPP, and Terms rules. When AI is available, sampled frames are reviewed for logos, clips, and graphic content.",
  },
  {
    title: "A clearance, not a promise",
    body: "Greenlight, caution, or hold — plus what to fix. This is not Content ID, not a lawyer, and not YouTube. Only YouTube’s fingerprint database knows if a specific recording will match.",
  },
];

function AboutPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">How it works</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
          A QC bay for the upload you have not published yet.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          YouTube will not tell you in advance whether Content ID will claim a track, or whether a
          reviewer will age-restrict a cold open. Greenlight is the checklist a rights desk would
          run — encoded as software.
        </p>

        <ol className="mt-10 space-y-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-[var(--radius-lg)] bg-card p-5 shadow-[var(--shadow-border)]">
              <p className="text-xs tabular-nums text-subtle">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-1 text-base font-medium">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-medium text-foreground">What this cannot do</h2>
          <p>
            It cannot query YouTube’s private Content ID corpus, see unpublished Content ID rules,
            or guarantee fair use. A greenlight means we did not find a published-policy problem in
            what you showed us — not that a claim is impossible.
          </p>
          <p>
            Greenlight is not affiliated with YouTube, Google, or any rightsholder. Reports are
            stored only in this browser. Use them as a pre-flight, then keep licenses and still
            follow YouTube’s own screens at upload.
          </p>
        </section>

        <div className="mt-10">
          <Button asChild>
            <Link to="/">Open the scanner</Link>
          </Button>
        </div>
      </main>
    </AppShell>
  );
}
