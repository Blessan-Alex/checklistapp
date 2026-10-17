"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StaffAppShell } from "@/components/staff/staff-app-shell";
import { CaseReviewEditor } from "@/components/staff/case-review-editor";
import { ROUTES } from "@/config/routes";
import { useCaseQuery } from "@/lib/hooks/use-case-api";
import { Loader2 } from "lucide-react";

export function StaffCaseReview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [caseId, setCaseId] = useState<string | null>(null);

  useEffect(() => {
    void params.then(({ id }) => setCaseId(id));
  }, [params]);

  const apiQuery = useCaseQuery(caseId);
  const caseRecord = apiQuery.data;

  useEffect(() => {
    if (!caseId) {
      return;
    }
    if (apiQuery.isError) {
      router.replace(ROUTES.staffCases);
    }
  }, [caseId, apiQuery.isError, router]);

  if (!caseRecord) {
    if (apiQuery.isLoading) {
      return (
        <StaffAppShell activeNav="cases">
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2
              className="size-8 animate-spin text-primary"
              aria-label="Loading case"
            />
          </div>
        </StaffAppShell>
      );
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
