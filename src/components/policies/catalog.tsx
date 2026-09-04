import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABEL, POLICIES, type Policy } from "@/lib/scan/policies";
import type { PolicyCategory } from "@/lib/scan/types";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: "all" | PolicyCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "copyright", label: "Copyright" },
  { id: "community", label: "Community" },
  { id: "advertiser", label: "Ads" },
  { id: "kids", label: "Kids" },
  { id: "monetization", label: "YPP" },
  { id: "terms", label: "Terms" },
];

export function PolicyCatalog() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | PolicyCategory>("all");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POLICIES.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.summary} ${p.keywords.join(" ")} ${CATEGORY_LABEL[p.category]}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, filter]);

  return (
    <div className="space-y-8">
      <section className="max-w-2xl space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">YouTube rulebook</p>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
          The policies this scanner actually checks.
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Summaries of copyright, Community Guidelines, advertiser-friendly rules, child safety,
          monetization, and the Terms of Service — with official sources.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search music, kids, strikes, ads…"
          className="sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex h-11 items-center rounded-full px-3 text-sm",
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground shadow-[var(--shadow-border)] hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-subtle">{items.length} policies</p>

      <Accordion type="single" collapsible className="rounded-[var(--radius-xl)] bg-card px-5 shadow-[var(--shadow-border)] sm:px-6">
        {items.map((policy) => (
          <PolicyRow key={policy.id} policy={policy} />
        ))}
      </Accordion>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing matches. Try a broader word, like “music” or “kids”.</p>
      ) : null}
    </div>
  );
}

function PolicyRow({ policy }: { policy: Policy }) {
  return (
    <AccordionItem value={policy.id}>
      <AccordionTrigger>
        <span className="flex flex-col items-start gap-1 pr-4">
          <span className="text-[11px] uppercase tracking-[0.16em] text-subtle">
            {CATEGORY_LABEL[policy.category]}
          </span>
          <span>{policy.title}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <p className="mb-3">{policy.summary}</p>
        <p className="mb-3">
          <span className="font-medium text-foreground">If you break it · </span>
          {policy.whatHappens}
        </p>
        <p className="mb-2 font-medium text-foreground">Stay clear</p>
        <ul className="mb-4 list-disc space-y-1 pl-4">
          {policy.howToStaySafe.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <a
          href={policy.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Official source · {policy.sourceLabel}
        </a>
      </AccordionContent>
    </AccordionItem>
  );
}
