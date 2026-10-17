"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Download,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { RejectSlotDialog } from "@/components/staff/reject-slot-dialog";
import { ZipDownloadCard } from "@/components/staff/zip-download-card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { clientUploadSlots } from "@/lib/client-portal";
import { useMockDataSource } from "@/lib/data-source";
import { mimeTypeFromFilename } from "@/lib/mime-from-filename";
import {
  approveClientSlotUpload,
  completeStaffPackReview,
  rejectClientSlotUpload,
} from "@/lib/mock-store";
import { isSlotRejected } from "@/lib/slot-status";
import {
  allClientUploadsStaffApproved,
  canStaffDownloadZip,
  caseAwaitingStaffReview,
  firstPendingReviewSlotId,
  isSlotStaffApproved,
  staffReviewCounts,
} from "@/lib/staff-review";
import type { Case, Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

function slotReviewIcon(slot: Slot) {
  if (isSlotRejected(slot)) {
    return <XCircle className="size-4 shrink-0 text-[var(--brand-golden-ochre)]" />;
  }
  if (!slot.upload) {
    return <CircleDashed className="size-4 shrink-0 text-muted-foreground" />;
  }
  if (isSlotStaffApproved(slot)) {
    return <CheckCircle2 className="size-4 shrink-0 text-[var(--brand-rich-violet)]" />;
  }
  return <CircleDashed className="size-4 shrink-0 text-primary" />;
}

function DocumentPreview({
  caseRecord,
  slot,
  mockData,
}: {
  caseRecord: Case;
  slot: Slot;
  mockData: boolean;
}) {
  if (!slot.upload) {
    return (
      <p className="text-sm text-muted-foreground">
        Waiting for the client to upload this document.
      </p>
    );
  }

  if (mockData) {
    return (
      <div className="flex min-h-[min(24rem,50vh)] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
        <p className="text-sm font-medium text-foreground">{slot.upload.name}</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Document preview is available when the app runs against the API and
          blob storage. Approve or reject using the actions below.
        </p>
      </div>
    );
  }

  const fileUrl = api.staffSlotFileUrl(caseRecord.id, slot.id);
  const mime = mimeTypeFromFilename(slot.upload.name);
  const isPdf = mime === "application/pdf";
  const isImage = mime.startsWith("image/");

  if (isPdf) {
    return (
      <iframe
        title={slot.targetFileName}
        src={fileUrl}
        className="min-h-[min(32rem,60vh)] w-full rounded-lg border border-border bg-muted/20"
      />
    );
  }

  if (isImage) {
    return (
      <div className="flex min-h-[min(24rem,50vh)] items-center justify-center rounded-lg border border-border bg-muted/20 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={slot.targetFileName}
          className="max-h-[min(32rem,60vh)] max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">
        Preview is not available for this file type. Download the original to
        review.
      </p>
      <a
        href={fileUrl}
        download={slot.upload.name}
        className={cn(buttonVariants({ variant: "outline" }), "min-h-11 inline-flex items-center gap-2")}
      >
        <Download className="size-4" aria-hidden />
        Download {slot.upload.name}
      </a>
    </div>
  );
}

export function StaffDocumentReview({
  caseRecord,
  onUpdated,
}: {
  caseRecord: Case;
  onUpdated?: () => void;
}) {
  const mockData = useMockDataSource();
  const slots = useMemo(
    () => clientUploadSlots(caseRecord.slots),
    [caseRecord],
  );
  const inReview = caseAwaitingStaffReview(caseRecord);
  const counts = staffReviewCounts(caseRecord);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => firstPendingReviewSlotId(caseRecord) ?? slots.find((s) => s.upload)?.id,
  );
  const [rejectSlot, setRejectSlot] = useState<Slot | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selectedId || !slots.some((s) => s.id === selectedId)) {
      setSelectedId(
        firstPendingReviewSlotId(caseRecord) ?? slots.find((s) => s.upload)?.id,
      );
    }
  }, [caseRecord, selectedId, slots]);

  const selected = slots.find((s) => s.id === selectedId);
  if (!inReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review client uploads</CardTitle>
          <CardDescription>
            Available after the client submits their document pack.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  async function refreshAfter(action: () => Promise<void> | void) {
    setBusy(true);
    try {
      await action();
      onUpdated?.();
    } finally {
      setBusy(false);
    }
  }

  async function handleApprove() {
    if (!selected?.upload) {
      return;
    }
    try {
      await refreshAfter(async () => {
        let updated: Case | undefined;
        if (mockData) {
          updated = approveClientSlotUpload(caseRecord.id, selected.id);
          if (!updated) {
            throw new Error("approve failed");
          }
        } else {
          const res = await api.approveSlotUpload(caseRecord.id, selected.id);
          updated = res.case;
        }
        const nextId = updated
          ? firstPendingReviewSlotId(updated)
          : undefined;
        if (nextId) {
          setSelectedId(nextId);
        }
        toast.success("Document approved");
      });
    } catch {
      toast.error("Could not approve document");
    }
  }

  async function handleRejectConfirm(message: string) {
    if (!rejectSlot) {
      return;
    }
    try {
      if (mockData) {
        const updated = rejectClientSlotUpload(
          caseRecord.id,
          rejectSlot.id,
          message,
        );
        if (!updated) {
          toast.error("Could not send to client");
          return;
        }
      } else {
        await api.rejectSlotUpload(caseRecord.id, rejectSlot.id, message);
      }
      toast.success("Client will see your message on this slot");
      onUpdated?.();
    } catch {
      toast.error("Could not send to client");
    }
  }

  async function handleCompleteReview() {
    try {
      await refreshAfter(async () => {
        if (mockData) {
          const updated = completeStaffPackReview(caseRecord.id);
          if (!updated) {
            throw new Error("complete failed");
          }
        } else {
          await api.completeStaffReview(caseRecord.id);
        }
        toast.success("Pack ready — you can download the zip");
      });
    } catch {
      toast.error("Approve every document before finishing review");
    }
  }

  const canApproveSelected =
    inReview &&
    selected?.upload &&
    !isSlotRejected(selected) &&
    !isSlotStaffApproved(selected);
  const reviewComplete = allClientUploadsStaffApproved(caseRecord);
  const packReady = canStaffDownloadZip(caseRecord);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <h2 className="text-base font-semibold text-primary">
          Review client uploads
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {!mockData && caseRecord.checklistFileName ? (
            <a
              href={api.staffChecklistFileUrl(caseRecord.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 block text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              Original checklist PDF
            </a>
          ) : null}
          <span className="font-medium text-foreground">
            {counts.approved} approved
          </span>
          {" · "}
          {counts.pending} to review
          {counts.rejected > 0 ? (
            <>
              {" · "}
              <span className="text-[var(--brand-golden-ochre)]">
                {counts.rejected} changes needed
              </span>
            </>
          ) : null}
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(11rem,16rem)_1fr]">
        <ul className="max-h-[min(28rem,50vh)] space-y-1 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2 lg:max-h-[min(36rem,65vh)]">
          {slots.map((slot) => (
            <li key={slot.id}>
              <button
                type="button"
                onClick={() => setSelectedId(slot.id)}
                className={cn(
                  "flex w-full min-h-11 items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-card",
                  selectedId === slot.id && "bg-card shadow-sm ring-1 ring-border",
                )}
              >
                {slotReviewIcon(slot)}
                <span className="min-w-0 flex-1 truncate font-medium">
                  {slot.targetFileName}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex min-w-0 flex-col">
          {selected ? (
            <>
              <div className="mb-3 min-w-0">
                <p className="font-semibold text-primary">
                  {selected.targetFileName}
                </p>
                {selected.upload ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {selected.upload.name}
                  </p>
                ) : null}
                {isSlotRejected(selected) && selected.rejection ? (
                  <p className="mt-2 text-sm text-[var(--brand-golden-ochre)]">
                    Waiting for client: {selected.rejection.message}
                  </p>
                ) : null}
              </div>
              <DocumentPreview
                caseRecord={caseRecord}
                slot={selected}
                mockData={mockData}
              />
              <div className="sticky bottom-0 mt-4 flex flex-col gap-2 border-t border-border bg-card/95 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  type="button"
                  className="min-h-11 flex-1 sm:flex-none"
                  disabled={!canApproveSelected || busy}
                  onClick={() => void handleApprove()}
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : null}
                  Approve &amp; next
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 flex-1 sm:flex-none"
                  disabled={!selected.upload || busy}
                  onClick={() => {
                    setRejectSlot(selected);
                    setRejectOpen(true);
                  }}
                >
                  Ask for new file
                </Button>
                {!mockData && selected.upload ? (
                  <a
                    href={api.staffSlotFileUrl(caseRecord.id, selected.id)}
                    download={selected.upload.name}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "min-h-11 inline-flex items-center justify-center",
                    )}
                  >
                    Download original
                  </a>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a document to review.
            </p>
          )}
        </div>
      </div>

      {reviewComplete && caseRecord.status === "submitted" ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Finish review</CardTitle>
            <CardDescription>
              Every client document is approved. Build the final Home Office
              pack.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              className="min-h-11"
              disabled={busy}
              onClick={() => void handleCompleteReview()}
            >
              Mark pack ready for zip
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {packReady ? (
        <div className="max-w-md">
          <ZipDownloadCard
            caseRecord={caseRecord}
            onStoreChange={onUpdated}
          />
        </div>
      ) : reviewComplete ? null : (
        <p className="text-sm text-muted-foreground">
          Approve all documents to unlock the zip download.
        </p>
      )}

      <RejectSlotDialog
        open={rejectOpen}
        slot={rejectSlot}
        onOpenChange={setRejectOpen}
        onConfirm={(message) => void handleRejectConfirm(message)}
      />
    </div>
  );
}
