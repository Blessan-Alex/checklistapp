import { Suspense } from "react";
import { StaffRouteGuard } from "@/components/staff/staff-route-guard";
import { Loader2 } from "lucide-react";

/** Client auth guard cannot render child segments during instant-nav validation. */
export const instant = false;

function StaffAuthFallback() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" aria-label="Loading" />
    </div>
  );
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<StaffAuthFallback />}>
      <StaffRouteGuard>{children}</StaffRouteGuard>
    </Suspense>
  );
}
