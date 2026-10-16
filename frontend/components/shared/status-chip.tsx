import { Badge } from "@/components/ui/badge";
import type { CaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  live: {
    label: "Live",
    className:
      "bg-[color-mix(in_srgb,var(--brand-soft-lavender)_45%,var(--brand-warm-ivory))] text-[var(--brand-dark-indigo)]",
  },
  client_in_progress: {
    label: "In progress",
    className:
      "bg-[color-mix(in_srgb,var(--brand-golden-ochre)_35%,var(--brand-warm-ivory))] text-[var(--brand-dark-indigo)]",
  },
  submitted: {
    label: "Submitted",
    className:
      "bg-[color-mix(in_srgb,var(--brand-soft-lavender)_25%,var(--brand-warm-ivory))] text-[var(--brand-deep-purple)]",
  },
  zip_ready: {
    label: "Zip ready",
    className: "bg-[var(--brand-rich-violet)] text-[var(--brand-warm-ivory)]",
  },
};

export function StatusChip({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      className={cn(
        "min-h-6 border-0 px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
