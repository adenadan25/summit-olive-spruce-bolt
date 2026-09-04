import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PolicyCatalog } from "@/components/policies/catalog";

export const Route = createFileRoute("/policies")({ component: PoliciesPage });

function PoliciesPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <PolicyCatalog />
      </main>
    </AppShell>
  );
}
