"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { StaffAppShell } from "@/components/staff/staff-app-shell";
import { DemoShortcutsCard } from "@/components/staff/demo-shortcuts-card";
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
import {
  clientUploadProgress,
  notifyMockStoreChanged,
  subscribeMockStore,
} from "@/lib/client-portal";
import { useMockDataSource } from "@/lib/data-source";
import { useCaseQuery } from "@/lib/hooks/use-case-api";
import { getCaseById } from "@/lib/mock-store";
import { caseAwaitingStaffReview } from "@/lib/staff-review";
import { cn } from "@/lib/utils";

function clientPortalUrl(token: string): string {
  if (typeof window === "undefined") {
    return ROUTES.clientPortal(token);
  }
  return `${window.location.origin}${ROUTES.clientPortal(token)}`;
}

export function StaffCaseDetail({
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

  const refreshCase = useCallback(() => {
    if (mockData) {
      notifyMockStoreChanged();
    } else {
      void apiQuery.refetch();
    }
  }, [mockData, apiQuery]);

  useEffect(() => {
    if (!caseId) {
      return;
    }
    if (mockData && caseId && !mockCase) {
      router.replace(ROUTES.staffCases);
      return;
    }
    if (!mockData && apiQuery.isError) {
      router.replace(ROUTES.staffCases);
    }
  }, [caseId, mockCase, mockData, apiQuery.isError, router]);

  useEffect(() => {
    if (!caseId || !caseRecord) {
      return;
    }
    if (caseRecord.status === "draft") {
      router.replace(ROUTES.staffCaseReview(caseRecord.id));
    }
  }, [caseId, caseRecord, router]);

  if (!caseRecord) {
    if (!mockData && apiQuery.isLoading) {
      return null;
    }
    return null;
  }

  if (caseRecord.status === "draft") {
    return null;
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
                url={clientPortalUrl(caseRecord.clientToken)}
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

        {mockData ? (
          <DemoShortcutsCard
            caseRecord={caseRecord}
            onStoreChange={refreshCase}
          />
        ) : null}
      </div>
    </StaffAppShell>
  );
}
