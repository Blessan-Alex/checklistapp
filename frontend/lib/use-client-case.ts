"use client";

import { useCallback } from "react";
import { isClientPortalLocked } from "@/lib/client-portal";
import { ApiError } from "@/lib/api-client";
import { useClientCaseQuery } from "@/lib/hooks/use-case-api";

export function useClientCase(token: string) {
  const apiQuery = useClientCaseQuery(token);

  const refresh = useCallback(() => {
    void apiQuery.refetch();
  }, [apiQuery]);

  const apiError =
    apiQuery.error instanceof ApiError ? apiQuery.error : undefined;

  const ready = !apiQuery.isLoading;
  const caseRecord = apiQuery.data;
  const notFound = ready && apiError?.status === 404;
  const unauthorized = ready && apiError?.status === 401;
  const offline =
    ready && Boolean(apiQuery.isError) && !notFound && !unauthorized;

  return {
    caseRecord,
    ready,
    locked: caseRecord ? isClientPortalLocked(caseRecord) : false,
    refresh,
    offline,
    notFound,
    unauthorized,
  };
}
