import { Badge } from "@/components/ui/badge";
import type { Route } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROUTE_LABEL: Record<Route, string> = {
  skilled_worker: "Skilled Worker",
  ilr: "ILR",
};

export function RouteBadge({
  route,
  className,
}: {
  route: Route;
  className?: string;
}) {
  const isIlr = route === "ilr";

  return (
    <Badge
      className={cn(
        "min-h-6 border-0 px-2.5 py-0.5 text-xs font-semibold",
        isIlr
          ? "bg-[var(--brand-deep-purple)] text-[var(--brand-warm-ivory)]"
          : "bg-[var(--brand-soft-lavender)] text-[var(--brand-dark-indigo)]",
        className,
      )}
    >
      {ROUTE_LABEL[route]}
    </Badge>
  );
}
