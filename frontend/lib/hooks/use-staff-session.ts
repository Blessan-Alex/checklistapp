"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError, apiFetch } from "@/lib/api-client";

export const staffSessionQueryKey = ["staff", "session"] as const;

async function fetchStaffSession(): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/api/auth/session");
}

export function useStaffSession() {
  return useQuery({
    queryKey: staffSessionQueryKey,
    queryFn: fetchStaffSession,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
