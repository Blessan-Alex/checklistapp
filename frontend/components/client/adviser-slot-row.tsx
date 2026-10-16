import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Slot } from "@/lib/types";

export function AdviserSlotRow({
  slot,
  className,
}: {
  slot: Slot;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[72px] items-center gap-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-4 py-3",
        className,
      )}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground"
        aria-hidden
      >
        {slot.sortNumber}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-muted-foreground">
          {slot.targetFileName}
        </p>
        <p className="text-xs text-muted-foreground">
          Prepared by your adviser
        </p>
      </div>
      <FileText className="size-5 shrink-0 text-muted-foreground/60" aria-hidden />
    </div>
  );
}
