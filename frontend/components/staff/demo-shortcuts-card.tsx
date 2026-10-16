"use client";

import { FlaskConical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { resetDemoCase, simulateClientCompleted } from "@/lib/mock-store";
import type { Case } from "@/lib/types";
import { toast } from "sonner";

export function DemoShortcutsCard({
  caseRecord,
  onStoreChange,
}: {
  caseRecord: Case;
  onStoreChange: () => void;
}) {
  function handleSimulate() {
    const updated = simulateClientCompleted(caseRecord.id);
    if (!updated) {
      return;
    }
    onStoreChange();
    toast.success("Client uploads simulated", {
      description: "All slots filled — case marked submitted.",
    });
  }

  function handleReset() {
    const updated = resetDemoCase(caseRecord.id);
    if (!updated) {
      return;
    }
    onStoreChange();
    toast.message("Demo case reset", {
      description: "Uploads cleared for this case.",
    });
  }

  function handlePreviewClient() {
    const token = caseRecord.clientToken;
    if (!token) {
      toast.error("Publish the case first to get a client link.");
      return;
    }
    window.open(ROUTES.clientPortal(token), "_blank", "noopener,noreferrer");
  }

  return (
    <details className="group rounded-xl border border-dashed border-border/80 bg-muted/15 text-sm">
      <summary
        className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden"
      >
        <FlaskConical
          className="size-4 text-primary/80"
          aria-hidden
        />
        Demo tools
        <span className="ml-auto text-xs font-normal opacity-80">
          expand
        </span>
      </summary>
      <div className="flex flex-col gap-2 border-t border-border/60 px-4 py-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-10"
          onClick={handleSimulate}
        >
          Simulate client completed
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10"
          onClick={handleReset}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset case
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10"
          onClick={handlePreviewClient}
        >
          Preview as client
        </Button>
      </div>
    </details>
  );
}
