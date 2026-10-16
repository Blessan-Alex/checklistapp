"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { AppShellClient } from "@/components/shells/app-shell-client";
import { ClientNotFound } from "@/components/client/client-not-found";
import { ClientPayloadTooLarge } from "@/components/client/client-payload-too-large";
import { ClientUnauthorized } from "@/components/client/client-unauthorized";
import { ReplaceFileDialog } from "@/components/client/replace-file-dialog";
import { DontList } from "@/components/shared/dont-list";
import { InstructionPanel } from "@/components/shared/instruction-panel";
import { SampleThumb } from "@/components/shared/sample-thumb";
import { UploadDropzone } from "@/components/shared/upload-dropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { clientUploadProgress, isClientPortalLocked } from "@/lib/client-portal";
import { isSlotRejected } from "@/lib/slot-status";
import { api, ApiError, queryKeys } from "@/lib/api-client";
import { useMockDataSource } from "@/lib/data-source";
import { useQueryClient } from "@tanstack/react-query";
import {
  markClientInProgress,
  setSlotUpload,
} from "@/lib/mock-store";
import { useClientCase } from "@/lib/use-client-case";
import { HO_CONSENT_BLANK_PDF } from "@/lib/add-manual-slot";
import type { Slot } from "@/lib/types";

function SlotComplianceAlerts({ slot }: { slot: Slot }) {
  if (slot.instructionType === "sharecode") {
    return (
      <Alert className="border-[var(--brand-golden-ochre)]/50 bg-[color-mix(in_srgb,var(--brand-golden-ochre)_12%,var(--brand-warm-ivory))]">
        <AlertTitle>Share code reminder</AlertTitle>
        <AlertDescription>
          On GOV.UK, choose <strong>“To prove an immigration matter”</strong> —
          not “right to rent” or “right to work”. Your screenshot must show the
          full code and expiry.
        </AlertDescription>
      </Alert>
    );
  }

  if (slot.instructionType === "evisa") {
    return (
      <Alert className="border-[var(--brand-soft-lavender)]/60 bg-muted/50">
        <AlertTitle>eVisa dates</AlertTitle>
        <AlertDescription>
          Your screenshot must clearly show the <strong>visa start date</strong>{" "}
          and <strong>visa expiry date</strong>. Missing dates may delay your
          application.
        </AlertDescription>
      </Alert>
    );
  }

  if (
    slot.instructionType === "absence-letter" ||
    slot.instructionType === "travel-ticket"
  ) {
    return (
      <Alert className="border-primary/20 bg-primary/5">
        <AlertTitle>ILR absence evidence</AlertTitle>
        <AlertDescription>
          Your employer letter and travel ticket are reviewed together. Dates,
          purpose of travel, and destinations must match across both uploads.
        </AlertDescription>
      </Alert>
    );
  }

  if (slot.instructionType === "payslip" || slot.instructionType === "bank") {
    return (
      <Alert className="border-primary/20 bg-primary/5">
        <AlertTitle>ILR financial evidence</AlertTitle>
        <AlertDescription>
          Payslip and bank statement should be dated no earlier than{" "}
          <strong>one calendar month</strong> before your application date. The
          statement must show the payment from your payslip.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export function ClientSlotDetail({
  token,
  slotId,
}: {
  token: string;
  slotId: string;
}) {
  const router = useRouter();
  const mockData = useMockDataSource();
  const queryClient = useQueryClient();
  const { caseRecord, ready, refresh, offline, notFound, unauthorized } =
    useClientCase(token);
  const [savedFlash, setSavedFlash] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [payloadTooLarge, setPayloadTooLarge] = useState(false);

  const slot = caseRecord?.slots.find((s) => s.id === slotId);
  const locked = caseRecord ? isClientPortalLocked(caseRecord) : false;

  useEffect(() => {
    if (ready && caseRecord && !slot) {
      router.replace(ROUTES.clientPortal(token));
    }
  }, [ready, caseRecord, slot, router, token]);

  if (!ready) {
    return null;
  }

  if (payloadTooLarge) {
    return (
      <ClientPayloadTooLarge backHref={ROUTES.clientSlot(token, slotId)} />
    );
  }

  if (unauthorized) {
    return <ClientUnauthorized />;
  }

  if (notFound || !caseRecord) {
    return <ClientNotFound />;
  }

  if (!slot || !slot.clientUpload) {
    return null;
  }

  const progress = clientUploadProgress(caseRecord);

  function handleDownloadConsent() {
    const url = slot?.downloadUrl ?? HO_CONSENT_BLANK_PDF;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function persistMockUpload(file: File) {
    if (!caseRecord || !slot) {
      return;
    }
    markClientInProgress(caseRecord.id);
    setSlotUpload(caseRecord.id, slot.id, {
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
    setSavedFlash(true);
    refresh();
    window.setTimeout(() => setSavedFlash(false), 2500);
  }

  function startApiUpload(file: File) {
    if (!slot) {
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    void api
      .uploadClientSlotWithProgress(token, slot.id, file, setUploadProgress)
      .then((data) => {
        queryClient.setQueryData(queryKeys.clientCase(token), data.case);
        setSavedFlash(true);
        refresh();
        window.setTimeout(() => setSavedFlash(false), 2500);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 413) {
          setPayloadTooLarge(true);
          return;
        }
        toast.error(
          error instanceof ApiError ? error.message : "Upload failed. Try again.",
        );
      })
      .finally(() => {
        setUploading(false);
        setUploadProgress(null);
      });
  }

  function handleFileSelect(file: File) {
    if (locked || !caseRecord || !slot || uploading) {
      return;
    }

    if (slot.upload) {
      setPendingFile(file);
      setReplaceOpen(true);
      return;
    }

    if (mockData) {
      persistMockUpload(file);
      return;
    }

    startApiUpload(file);
  }

  function confirmReplace() {
    if (!pendingFile) {
      setReplaceOpen(false);
      return;
    }
    if (mockData) {
      persistMockUpload(pendingFile);
    } else {
      startApiUpload(pendingFile);
    }
    setPendingFile(null);
    setReplaceOpen(false);
  }

  return (
    <AppShellClient
      applicantFirstName={caseRecord.applicantFirstName}
      completed={progress.completed}
      total={progress.total}
      homeHref={ROUTES.clientPortal(token)}
    >
      <div className="space-y-6">
        <div>
          <Link
            href={ROUTES.clientPortal(token)}
            className="mb-2 inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-medium text-primary hover:bg-muted"
          >
            ← Back to checklist
          </Link>
          <h1 className="text-xl font-semibold text-primary">
            {slot.targetFileName}
          </h1>
        </div>

        {offline ? (
          <Alert variant="destructive">
            <AlertTitle>Connection problem</AlertTitle>
            <AlertDescription>
              We could not reach the server. Check your connection and refresh —
              your last saved uploads are stored on the server when online.
            </AlertDescription>
          </Alert>
        ) : null}

        <SlotComplianceAlerts slot={slot} />

        {isSlotRejected(slot) && slot.rejection ? (
          <Alert
            className="border-[var(--brand-golden-ochre)]/60 bg-[color-mix(in_srgb,var(--brand-golden-ochre)_14%,var(--brand-warm-ivory))]"
          >
            <AlertTitle>Please upload a replacement</AlertTitle>
            <AlertDescription>{slot.rejection.message}</AlertDescription>
          </Alert>
        ) : null}

        <InstructionPanel
          title="What to upload"
          content={slot.instructions}
        />

        <DontList items={slot.donts} />

        {slot.instructionType === "ho-consent" ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full"
            onClick={handleDownloadConsent}
            disabled={locked}
          >
            Download blank form
          </Button>
        ) : null}

        {slot.sampleUrl ? (
          <SampleThumb
            sampleUrl={slot.sampleUrl}
            alt={`Example: ${slot.documentName}`}
          />
        ) : null}

        {locked ? (
          <p className="text-sm text-muted-foreground">
            Uploads are closed — you have already submitted your documents.
          </p>
        ) : (
          <UploadDropzone
            onFileSelect={handleFileSelect}
            disabled={uploading}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
        )}

        <ReplaceFileDialog
          open={replaceOpen}
          currentFileName={slot.upload?.name ?? "your file"}
          newFileName={pendingFile?.name ?? ""}
          onConfirm={confirmReplace}
          onCancel={() => {
            setReplaceOpen(false);
            setPendingFile(null);
          }}
        />

        {slot.upload ? (
          <p
            className="flex items-center gap-2 text-sm font-medium text-[var(--brand-rich-violet)]"
            role="status"
          >
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
            Saved ✓ — {slot.upload.name}
            {savedFlash ? " (just now)" : ""}
          </p>
        ) : null}
      </div>
    </AppShellClient>
  );
}
