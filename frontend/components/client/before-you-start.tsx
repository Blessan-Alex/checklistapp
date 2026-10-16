"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { InstructionPanel } from "@/components/shared/instruction-panel";
import { cn } from "@/lib/utils";

export function BeforeYouStart({
  content,
  defaultOpen = true,
}: {
  content: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-2 px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-primary">
          Before you start
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="border-t border-border px-2 pb-2">
          <InstructionPanel title="General instructions" content={content} />
        </div>
      ) : null}
    </div>
  );
}
