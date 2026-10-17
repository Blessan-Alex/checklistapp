"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShellClient } from "@/components/shells/app-shell-client";
import { ClientNotFound } from "@/components/client/client-not-found";
import { ClientPayloadTooLarge } from "@/components/client/client-payload-too-large";
import { ClientUploadError } from "@/components/client/client-upload-error";
import { ClientUnauthorized } from "@/components/client/client-unauthorized";
import { ReplaceFileDialog } from "@/components/client/replace-file-dialog";
import { DontList } from "@/components/shared/dont-list";
import { InstructionPanel } from "@/components/shared/instruction-panel";
import { SampleThumb } from "@/components/shared/sample-thumb";
import { UploadDropzone } from "@/components/shared/upload-dropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import {
  canClientWriteSlot,
  clientUploadProgress,
} from "@/lib/client-portal";
import { clientUploadUserMessage } from "@/lib/client-upload-user-messages";
import { isSlotRejected } from "@/lib/slot-status";
import { api, queryKeys } from "@/lib/api-client";
import {
  ClientSlotUploadError,
  uploadClientSlotFile,
} from "@/lib/client-slot-upload";
import { validateClientUploadSize } from "@/lib/client-upload-validation";
import { mimeTypeFromFilename } from "@/lib/mime-from-filename";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const { caseRecord, ready, refresh, offline, notFound, unauthorized } =
    useClientCase(token);
  const [savedFlash, setSavedFlash] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [payloadTooLarge, setPayloadTooLarge] = useState(false);
  const [uploadError, setUploadError] = useState<{
    kind: ClientSlotUploadError["kind"];
    message: string;
  } | null>(null);
  const [browserOffline, setBrowserOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );
  const lastFileRef = useRef<File | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setPayloadTooLarge(false);
    setUploadError(null);
  }, [token, slotId]);

  useEffect(() => {
    const goOffline = () => setBrowserOffline(true);
    const goOnline = () => setBrowserOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const slot = caseRecord?.slots.find((s) => s.id === slotId);
  const slotWritable =
    caseRecord && slot ? canClientWriteSlot(caseRecord, slot) : false;

  useEffect(() => {
    if (ready && caseRecord && !slot) {
      router.replace(ROUTES.clientPortal(token));
    }
  }, [ready, caseRecord, slot, router, token]);

  if (!ready) {
    return null;
  }

  if (unauthorized) {
    return <ClientUnauthorized />;
  }

  if (offline && !caseRecord) {
    return (
      <AppShellClient
        applicantFirstName="…"
        completed={0}
        total={1}
        homeHref={ROUTES.clientPortal(token)}
      >
        <Alert variant="destructive">
          <AlertTitle>Connection problem</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>We could not load this document slot. Check your connection.</p>
            <Button type="button" variant="outline" className="min-h-11" onClick={refresh}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </AppShellClient>
    );
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

  function startApiUpload(file: File) {
    if (!slot || !caseRecord) {
      return;
    }
    lastFileRef.current = file;
    setUploadError(null);
    setPayloadTooLarge(false);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setUploading(true);
    setUploadProgress(0);
    void uploadClientSlotFile({
      token,
      caseId: caseRecord.id,
      slotId: slot.id,
      file,
      onProgress: setUploadProgress,
      signal: controller.signal,
    })
      .then((data) => {
        queryClient.setQueryData(queryKeys.clientCase(token), data.case);
        setSavedFlash(true);
        refresh();
        window.setTimeout(() => setSavedFlash(false), 2500);
      })
      .catch((error: unknown) => {
        if (error instanceof ClientSlotUploadError) {
          if (error.kind === "cancelled") {
            return;
          }
          if (error.kind === "too_large") {
            setUploadError({ kind: "too_large", message: error.message });
            setPayloadTooLarge(true);
            return;
          }
          setUploadError({ kind: error.kind, message: error.message });
          return;
        }
        const fallback = clientUploadUserMessage("unknown");
        setUploadError({
          kind: "unknown",
          message: fallback.reason,
        });
      })
      .finally(() => {
        setUploading(false);
        setUploadProgress(null);
        abortRef.current = null;
      });
  }

  function cancelUpload() {
    abortRef.current?.abort();
  }

  function retryLastUpload() {
    const file = lastFileRef.current;
    if (file && slotWritable) {
      startApiUpload(file);
    }
  }

  function handleFileSelect(file: File) {
    if (!slotWritable || !caseRecord || !slot || uploading) {
      return;
    }
    setPayloadTooLarge(false);
    setUploadError(null);
    if (browserOffline) {
      setUploadError({
        kind: "offline",
        message:
          "You appear to be offline. Connect to the internet, then try again.",
      });
      return;
    }
    const sizeError = validateClientUploadSize(file);
    if (sizeError) {
      setPayloadTooLarge(true);
      return;
    }

    if (slot.upload) {
      setPendingFile(file);
      setReplaceOpen(true);
      return;
    }

    startApiUpload(file);
  }

  function confirmReplace() {
    if (!pendingFile) {
      setReplaceOpen(false);
      return;
    }
    startApiUpload(pendingFile);
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
            <AlertTitle>Changes needed</AlertTitle>
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
            disabled={!slotWritable}
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

        {!slotWritable && slot.upload ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Your upload</p>
            {mimeTypeFromFilename(slot.upload.name) === "application/pdf" ? (
              <iframe
                title={slot.targetFileName}
                src={api.clientSlotFileUrl(token, slot.id)}
                className="min-h-[min(20rem,45vh)] w-full rounded-lg border border-border"
              />
            ) : mimeTypeFromFilename(slot.upload.name).startsWith("image/") ? (
              <div className="rounded-lg border border-border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={api.clientSlotFileUrl(token, slot.id)}
                  alt={slot.targetFileName}
                  className="max-h-[min(20rem,45vh)] w-full object-contain"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Saved as {slot.upload.name}
              </p>
            )}
          </div>
        ) : null}

        {!slotWritable ? (
          <p className="text-sm text-muted-foreground">
            {isSlotRejected(slot)
              ? "This slot is not open for upload right now. Contact your adviser if you need help."
              : "Uploads are closed — you have already submitted this document."}
          </p>
        ) : (
          <>
            {isSlotRejected(slot) ? (
              <p className="text-sm font-semibold text-primary">
                Upload replacement
              </p>
            ) : null}
            {browserOffline ? (
              <Alert variant="destructive">
                <AlertTitle>Offline</AlertTitle>
                <AlertDescription>
                  Uploads need an internet connection. Reconnect, then use Retry
                  upload or choose your file again.
                </AlertDescription>
              </Alert>
            ) : null}
            {uploadError && !payloadTooLarge ? (
              <ClientUploadError
                kind={uploadError.kind}
                message={uploadError.message}
                onRetry={retryLastUpload}
                onDismiss={() => setUploadError(null)}
              />
            ) : null}
            {payloadTooLarge ? (
              <ClientPayloadTooLarge
                onTryAgain={() => setPayloadTooLarge(false)}
                reason={uploadError?.kind === "too_large" ? uploadError.message : undefined}
              />
            ) : null}
            {uploading ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full"
                onClick={cancelUpload}
              >
                Cancel upload
              </Button>
            ) : null}
            <UploadDropzone
              onFileSelect={handleFileSelect}
              disabled={uploading || browserOffline}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          </>
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
