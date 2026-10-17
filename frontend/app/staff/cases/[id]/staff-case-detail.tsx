"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StaffAppShell } from "@/components/staff/staff-app-shell";
import { DeleteCaseCard } from "@/components/staff/delete-case-card";
import { InternalGuidanceDrawer } from "@/components/staff/internal-guidance-drawer";
import { ReopenCaseCard } from "@/components/staff/reopen-case-card";
import { StaffDocumentPack } from "@/components/staff/staff-document-pack";
import { StaffDocumentReview } from "@/components/staff/staff-document-review";
import { CoverLetterPanel } from "@/components/staff/cover-letter-panel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CopyLinkButton } from "@/components/shared/copy-link-button";
import { RouteBadge } from "@/components/shared/route-badge";
import { StatusChip } from "@/components/shared/status-chip";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { StaffCaseLoading } from "@/components/staff/staff-case-loading";
import { clientPortalAbsoluteUrl } from "@/lib/client-portal-url";
import { clientUploadProgress } from "@/lib/client-portal";
import { useStaffCaseLiveNotifications } from "@/lib/hooks/use-case-live-updates";
import { useStaffCasePage } from "@/lib/hooks/use-staff-case-page";
import { caseAwaitingStaffReview } from "@/lib/staff-review";
import { cn } from "@/lib/utils";

export function StaffCaseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { caseRecord, showLoading, sessionExpired, notFound, refreshCase } =
    useStaffCasePage(params);

  useStaffCaseLiveNotifications(caseRecord);

  useEffect(() => {
    if (!caseRecord) {
      return;
    }
    if (caseRecord.status === "draft") {
      router.replace(ROUTES.staffCaseReview(caseRecord.id));
    }
  }, [caseRecord, router]);

  if (sessionExpired || notFound) {
    return null;
  }

  if (showLoading || !caseRecord) {
    return <StaffCaseLoading />;
  }

  if (caseRecord.status === "draft") {
    return <StaffCaseLoading />;
  }

  const progress = clientUploadProgress(caseRecord);
  const defaultTab = caseAwaitingStaffReview(caseRecord)
    ? "review"
    : "documents";

  return (
    <StaffAppShell activeNav="cases">
      <div className="min-w-0 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                {caseRecord.applicantFullName}
              </h1>
              <RouteBadge route={caseRecord.route} />
              <StatusChip status={caseRecord.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              UAN <span className="break-all font-mono">{caseRecord.uan}</span>
              <span className="mx-2 hidden text-border sm:inline">·</span>
              <span className="mt-1 block sm:mt-0 sm:inline">
                Client progress{" "}
                <span className="font-medium text-foreground">
                  {progress.completed}/{progress.total}
                </span>
              </span>
            </p>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
            {caseRecord.clientToken ? (
              <CopyLinkButton
                url={clientPortalAbsoluteUrl(caseRecord.clientToken)}
                label="Copy client link"
                className="w-full sm:w-auto"
              />
            ) : null}
            <Link
              href={ROUTES.staffCaseReview(caseRecord.id)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "min-h-11 w-full justify-center text-muted-foreground sm:w-auto sm:min-h-9",
              )}
            >
              Edit checklist
            </Link>
            <InternalGuidanceDrawer
              className="min-h-11 w-full justify-center gap-1.5 text-muted-foreground sm:min-h-9 sm:w-auto"
            />
          </div>
        </div>

        <ReopenCaseCard caseRecord={caseRecord} onUpdated={refreshCase} />

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid h-auto w-full max-w-full grid-cols-3 gap-1 bg-muted/50 p-1 sm:max-w-xl">
            <TabsTrigger value="review" className="min-h-11 px-2">
              Review
            </TabsTrigger>
            <TabsTrigger value="documents" className="min-h-11 px-2">
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="cover-letter"
              className="min-h-11 px-2 text-muted-foreground"
            >
              Cover letter
            </TabsTrigger>
          </TabsList>
          <TabsContent value="review" className="mt-6 min-w-0">
            <StaffDocumentReview
              caseRecord={caseRecord}
              onUpdated={refreshCase}
            />
          </TabsContent>
          <TabsContent value="documents" className="mt-6 min-w-0">
            <StaffDocumentPack
              caseRecord={caseRecord}
              onUpdated={refreshCase}
            />
          </TabsContent>
          <TabsContent value="cover-letter" className="mt-6">
            <CoverLetterPanel
              caseRecord={caseRecord}
              onSaved={refreshCase}
            />
          </TabsContent>
        </Tabs>

        <DeleteCaseCard
          caseRecord={caseRecord}
          onDeleted={() => router.replace(ROUTES.staffCases)}
        />
      </div>
    </StaffAppShell>
  );
}
