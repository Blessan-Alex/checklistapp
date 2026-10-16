"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { StaffAppShell } from "@/components/staff/staff-app-shell";
import { DemoShortcutsCard } from "@/components/staff/demo-shortcuts-card";
import { InternalGuidanceDrawer } from "@/components/staff/internal-guidance-drawer";
import { ReopenCaseCard } from "@/components/staff/reopen-case-card";
import { StaffDocumentPack } from "@/components/staff/staff-document-pack";
import { CoverLetterPanel } from "@/components/staff/cover-letter-panel";
import { ZipDownloadCard } from "@/components/staff/zip-download-card";
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

  return (
    <StaffAppShell activeNav="cases">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-primary">
                {caseRecord.applicantFullName}
              </h1>
              <RouteBadge route={caseRecord.route} />
              <StatusChip status={caseRecord.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              UAN <span className="font-mono">{caseRecord.uan}</span>
              <span className="mx-2 text-border">·</span>
              Client progress{" "}
              <span className="font-medium text-foreground">
                {progress.completed}/{progress.total}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {caseRecord.clientToken ? (
              <CopyLinkButton
                url={clientPortalUrl(caseRecord.clientToken)}
                label="Copy client link"
              />
            ) : null}
            <Link
              href={ROUTES.staffCaseReview(caseRecord.id)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "min-h-9 text-muted-foreground",
              )}
            >
              Edit checklist
            </Link>
            <InternalGuidanceDrawer />
          </div>
        </div>

        <ReopenCaseCard caseRecord={caseRecord} onUpdated={refreshCase} />

        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="h-9 w-full max-w-xs bg-muted/50">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="cover-letter" className="text-muted-foreground">
              Cover letter
            </TabsTrigger>
          </TabsList>
          <TabsContent value="documents" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_minmax(16rem,20rem)] lg:items-start">
              <section className="space-y-3">
                <StaffDocumentPack
                  caseRecord={caseRecord}
                  onUpdated={refreshCase}
                />
              </section>
              <ZipDownloadCard
                caseRecord={caseRecord}
                onStoreChange={refreshCase}
              />
            </div>
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
