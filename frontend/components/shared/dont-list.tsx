import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DontList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-[color-mix(in_srgb,var(--brand-golden-ochre)_55%,transparent)] bg-[color-mix(in_srgb,var(--brand-golden-ochre)_12%,var(--brand-warm-ivory))] px-4 py-3",
        className,
      )}
    >
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--brand-dark-indigo)]">
        <AlertTriangle
          className="size-4 shrink-0 text-[var(--brand-golden-ochre)]"
          aria-hidden
        />
        Common mistakes
      </p>
      <ul className="space-y-1.5 text-sm text-[var(--brand-rich-violet)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-[var(--brand-golden-ochre)]" aria-hidden>
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
