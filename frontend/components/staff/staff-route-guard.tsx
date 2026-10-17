"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/config/routes";
import { useStaffSession } from "@/lib/hooks/use-staff-session";
import { Loader2 } from "lucide-react";

const PUBLIC_STAFF_PATHS = new Set<string>([ROUTES.staffLogin]);

export function StaffRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sessionQuery = useStaffSession();
  const isPublic = PUBLIC_STAFF_PATHS.has(pathname);
  const authed = sessionQuery.isSuccess;
  const sessionReady = sessionQuery.isFetched;

  useEffect(() => {
    if (!sessionReady) {
      return;
    }
    if (isPublic && authed) {
      router.replace(ROUTES.staffCases);
      return;
    }
    if (!isPublic && !authed) {
      router.replace(ROUTES.staffLogin);
    }
  }, [isPublic, authed, sessionReady, router]);

  const ready =
    sessionReady && ((isPublic && !authed) || (!isPublic && authed));

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  return children;
}
