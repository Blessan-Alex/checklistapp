"use client";

import { StaffAppShell } from "@/components/staff/staff-app-shell";
import { CaseReviewEditor } from "@/components/staff/case-review-editor";
import { StaffCaseLoading } from "@/components/staff/staff-case-loading";
import { useStaffCasePage } from "@/lib/hooks/use-staff-case-page";

export function StaffCaseReview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { caseRecord, showLoading, sessionExpired, notFound } =
    useStaffCasePage(params);

  if (sessionExpired || notFound) {
    return null;
  }

  if (showLoading || !caseRecord) {
    return <StaffCaseLoading />;
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
