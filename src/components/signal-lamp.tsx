import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/scan/types";

const LAMPS: { key: Verdict; className: string }[] = [
  { key: "hold", className: "bg-stop" },
  { key: "caution", className: "bg-hold" },
  { key: "green", className: "bg-go" },
];

export function SignalLamp({
  verdict,
  size = "md",
  lit = true,
}: {
  verdict?: Verdict | null;
  size?: "sm" | "md" | "lg";
  lit?: boolean;
}) {
  const dim =
    size === "lg" ? "size-3.5" : size === "sm" ? "size-1.5" : "size-2.5";
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      {LAMPS.map((lamp) => {
        const on = lit && verdict === lamp.key;
        return (
          <span
            key={lamp.key}
            className={cn(
              "rounded-full",
              dim,
              on ? lamp.className : "bg-elevated shadow-[var(--shadow-border)]",
              on && "shadow-[0_0_12px_currentColor]",
            )}
          />
        );
      })}
    </span>
  );
}

export function verdictLabel(verdict: Verdict) {
  if (verdict === "green") return "Greenlight";
  if (verdict === "caution") return "Caution";
  return "Hold";
}

export function verdictBadgeVariant(verdict: Verdict): "go" | "hold" | "stop" {
  if (verdict === "green") return "go";
  if (verdict === "caution") return "hold";
  return "stop";
}
