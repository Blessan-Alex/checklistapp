"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  isClientPortalLocked,
  notifyMockStoreChanged,
  subscribeMockStore,
} from "@/lib/client-portal";
import { ApiError } from "@/lib/api-client";
import { useMockDataSource } from "@/lib/data-source";
import { useClientCaseQuery } from "@/lib/hooks/use-case-api";
import { getCaseByClientToken, loadMockStore } from "@/lib/mock-store";

function readClientCase(token: string) {
  loadMockStore();
  return getCaseByClientToken(token);
}

export function useClientCase(token: string) {
  const mock = useMockDataSource();
  const apiQuery = useClientCaseQuery(token);

  const mockCase = useSyncExternalStore(
    subscribeMockStore,
    () => readClientCase(token),
    () => readClientCase(token),
  );

  const refresh = useCallback(() => {
    if (mock) {
      notifyMockStoreChanged();
    } else {
      void apiQuery.refetch();
    }
  }, [mock, apiQuery]);

  const apiError =
    apiQuery.error instanceof ApiError ? apiQuery.error : undefined;

  if (mock) {
    return {
      caseRecord: mockCase,
      ready: true,
      locked: mockCase ? isClientPortalLocked(mockCase) : false,
      refresh,
      offline: false,
      notFound: !mockCase,
      unauthorized: false,
    };
  }

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
