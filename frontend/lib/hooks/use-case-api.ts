"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, api, queryKeys } from "@/lib/api-client";
import {
  clientCaseNeedsLivePolling,
  LIVE_CASE_REFETCH_MS,
  staffCaseNeedsLivePolling,
} from "@/lib/hooks/use-case-live-updates";
import type { Case } from "@/lib/types";

export function useCasesQuery() {
  return useQuery({
    queryKey: queryKeys.cases,
    queryFn: async () => (await api.listCases()).cases,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useCaseQuery(caseId: string | null) {
  return useQuery({
    queryKey: queryKeys.case(caseId ?? ""),
    queryFn: async () => (await api.getCase(caseId!)).case,
    enabled: Boolean(caseId),
    refetchInterval: (query) =>
      staffCaseNeedsLivePolling(query.state.data as Case | undefined)
        ? LIVE_CASE_REFETCH_MS
        : false,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useClientCaseQuery(token: string) {
  return useQuery({
    queryKey: queryKeys.clientCase(token),
    queryFn: async () => (await api.getClientCase(token)).case,
    enabled: Boolean(token),
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      clientCaseNeedsLivePolling(query.state.data as Case | undefined)
        ? LIVE_CASE_REFETCH_MS
        : false,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 404 || error.status === 401)) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useSaveCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Case>;
    }) => (await api.patchCase(id, patch)).case,
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases });
      queryClient.invalidateQueries({ queryKey: queryKeys.case(saved.id) });
    },
  });
}

export function usePublishCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.publishCase(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases });
      queryClient.invalidateQueries({ queryKey: queryKeys.case(result.case.id) });
    },
  });
}

export function useCreateCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => api.createCase(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases });
    },
  });
}

export function useDeleteCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      confirmName,
    }: {
      id: string;
      confirmName: string;
    }) => api.deleteCase(id, confirmName),
    onSuccess: (_void, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases });
      queryClient.removeQueries({ queryKey: queryKeys.case(id) });
    },
  });
}

export function useClientSlotUploadMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slotId,
      file,
    }: {
      slotId: string;
      file: File;
    }) => api.uploadClientSlot(token, slotId, file),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.clientCase(token), data.case);
      queryClient.invalidateQueries({ queryKey: queryKeys.cases });
    },
  });
}

export function useClientSubmitMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.submitClientCase(token),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.clientCase(token), data.case);
      queryClient.invalidateQueries({ queryKey: queryKeys.cases });
    },
  });
}
