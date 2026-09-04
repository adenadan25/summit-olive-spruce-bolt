import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SignalLamp } from "@/components/signal-lamp";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Scan" },
  { to: "/policies", label: "Policies" },
  { to: "/about", label: "How it works" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(to_bottom,rgba(216,214,206,0.05),transparent)]" />

      <header className="relative z-10 border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3 min-h-11">
            <SignalLamp verdict="green" size="sm" />
            <span className="font-display text-xl tracking-tight italic">Greenlight</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-11 items-center px-3 text-sm transition-colors duration-[var(--motion-quick)]",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="relative z-10">{children}</div>

      <footer className="relative z-10 mt-16 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Not affiliated with YouTube or Google. A risk assessment, not legal advice or Content ID.</p>
          <p>Greenlight does not fingerprint audio against YouTube’s private database.</p>
        </div>
      </footer>
    </div>
  );
}
