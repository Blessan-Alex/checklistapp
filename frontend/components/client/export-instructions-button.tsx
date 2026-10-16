"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildClientInstructionsPrintHtml } from "@/lib/client-instructions-document";
import type { Case } from "@/lib/types";
import { toast } from "sonner";

export function ExportInstructionsButton({
  caseRecord,
  generalInstructions,
  compact = false,
}: {
  caseRecord: Case;
  generalInstructions: string;
  compact?: boolean;
}) {
  function handleExport() {
    const html = buildClientInstructionsPrintHtml(
      caseRecord,
      generalInstructions,
    );
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      toast.error("Allow pop-ups to print or save your instructions");
      URL.revokeObjectURL(url);
      return;
    }
    win.addEventListener("load", () => {
      win.focus();
      win.print();
    });
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    toast.success("Use Print → Save as PDF in your browser");
  }

  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "outline"}
      size={compact ? "sm" : "default"}
      className={
        compact
          ? "min-h-9 gap-1.5 text-muted-foreground"
          : "min-h-11 w-full gap-2 sm:w-auto"
      }
      onClick={handleExport}
    >
      <FileDown className="size-4" aria-hidden />
      {compact ? "Save as PDF" : "Save instructions (PDF)"}
    </Button>
  );
}
