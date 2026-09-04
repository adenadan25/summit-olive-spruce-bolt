import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Studio } from "@/components/scan/studio";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Studio />
      </main>
    </AppShell>
  );
}
