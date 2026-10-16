"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { StaffAppShell } from "@/components/staff/staff-app-shell";
import { CaseReviewEditor } from "@/components/staff/case-review-editor";
import { ROUTES } from "@/config/routes";
import { subscribeMockStore } from "@/lib/client-portal";
import { useMockDataSource } from "@/lib/data-source";
import { useCaseQuery } from "@/lib/hooks/use-case-api";
import { getCaseById } from "@/lib/mock-store";

export function StaffCaseReview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const mockData = useMockDataSource();
  const [caseId, setCaseId] = useState<string | null>(null);

  useEffect(() => {
    void params.then(({ id }) => setCaseId(id));
  }, [params]);

  const apiQuery = useCaseQuery(caseId);
  const mockCase = useSyncExternalStore(
    subscribeMockStore,
    () => (caseId ? getCaseById(caseId) : undefined),
    () => undefined,
  );

  const caseRecord = mockData ? mockCase : apiQuery.data;

  useEffect(() => {
    if (!caseId) {
      return;
    }
    if (mockData && !mockCase) {
      router.replace(ROUTES.staffCases);
      return;
    }
    if (!mockData && apiQuery.isError) {
      router.replace(ROUTES.staffCases);
    }
  }, [caseId, mockCase, mockData, apiQuery.isError, router]);

  if (!caseRecord) {
    if (!mockData && apiQuery.isLoading) {
      return null;
    }
    return null;
  }

  return (
    <StaffAppShell activeNav="cases">
      <CaseReviewEditor
        key={`${caseRecord.id}-${caseRecord.updatedAt ?? ""}`}
        initialCase={caseRecord}
      />
    </StaffAppShell>
  );
}
