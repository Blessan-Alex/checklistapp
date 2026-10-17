"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api-client";
import { staffSessionQueryKey } from "@/lib/hooks/use-staff-session";

/** Send staff to login when the API session cookie is missing or invalid. */
export function useStaffUnauthorizedRedirect(error: unknown) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionExpired = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (!sessionExpired) {
      return;
    }
    void queryClient.invalidateQueries({ queryKey: staffSessionQueryKey });
    router.replace(`${ROUTES.staffLogin}?reason=401`);
  }, [sessionExpired, queryClient, router]);

  return sessionExpired;
}
