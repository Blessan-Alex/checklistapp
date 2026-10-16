import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import type { Slot } from "@/lib/types";
import { isClientSlotComplete, isSlotRejected } from "@/lib/slot-status";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export function SlotCard({
  slot,
  href,
  className,
  disabled = false,
}: {
  slot: Slot;
  href: string;
  className?: string;
  disabled?: boolean;
}) {
  const rejected = isSlotRejected(slot);
  const complete = isClientSlotComplete(slot);
  const title = slot.targetFileName;

  if (disabled) {
    return (
      <div
        className={cn(
          "flex min-h-[72px] items-center gap-4 rounded-xl border border-border bg-muted/50 px-4 py-3 opacity-80",
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
          <p className="truncate font-medium text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">
            Submitted — read only
          </p>
        </div>
        <CheckCircle2
          className="size-6 shrink-0 text-[var(--brand-rich-violet)]"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-[72px] items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition hover:border-primary/40 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        rejected &&
          "border-[var(--brand-golden-ochre)]/60 bg-[color-mix(in_srgb,var(--brand-golden-ochre)_12%,var(--brand-warm-ivory))]",
        className,
      )}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
        aria-hidden
      >
        {slot.sortNumber}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {rejected ? "Replacement needed" : slot.documentName}
        </p>
      </div>
      {rejected ? (
        <AlertTriangle
          className="size-6 shrink-0 text-[var(--brand-golden-ochre)]"
          aria-label="Replacement requested"
        />
      ) : complete ? (
        <CheckCircle2
          className="size-6 shrink-0 text-[var(--brand-rich-violet)]"
          aria-label="Uploaded"
        />
      ) : (
        <Circle className="size-6 shrink-0 text-muted-foreground/50" aria-label="Not started" />
      )}
    </Link>
  );
}
