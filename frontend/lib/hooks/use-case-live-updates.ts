"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { clientUploadSlots } from "@/lib/client-portal";
import { caseAwaitingStaffReview } from "@/lib/staff-review";
import { isSlotRejected } from "@/lib/slot-status";
import type { Case } from "@/lib/types";

export const LIVE_CASE_REFETCH_MS = 4000;

export function staffCaseNeedsLivePolling(caseRecord: Case | undefined): boolean {
  return caseRecord ? caseAwaitingStaffReview(caseRecord) : false;
}

export function clientCaseNeedsLivePolling(caseRecord: Case | undefined): boolean {
  if (!caseRecord) {
    return false;
  }
  return (
    caseRecord.status === "live" ||
    caseRecord.status === "client_in_progress" ||
    caseRecord.status === "submitted"
  );
}

export function useStaffCaseLiveNotifications(caseRecord: Case | undefined) {
  const prevRef = useRef<Case | undefined>(undefined);
  const notifiedUploadAtRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = caseRecord;
    if (!prev || !caseRecord || prev.id !== caseRecord.id) {
      return;
    }

    for (const slot of clientUploadSlots(caseRecord.slots)) {
      if (!slot.upload || isSlotRejected(slot)) {
        continue;
      }
      const prevSlot = prev.slots.find((s) => s.id === slot.id);
      const uploadedAt = slot.upload.uploadedAt;
      const prevAt = prevSlot?.upload?.uploadedAt;
      if (prevAt === uploadedAt) {
        continue;
      }
      if (notifiedUploadAtRef.current[slot.id] === uploadedAt) {
        continue;
      }
      notifiedUploadAtRef.current[slot.id] = uploadedAt;
      const wasRejected = prevSlot ? isSlotRejected(prevSlot) : false;
      toast.message(
        wasRejected ? "Client uploaded a replacement" : "New client upload",
        { description: slot.targetFileName },
      );
    }
  }, [caseRecord]);
}

export function useClientCaseLiveNotifications(caseRecord: Case | undefined) {
  const prevRef = useRef<Case | undefined>(undefined);
  const notifiedRejectionAtRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = caseRecord;
    if (!prev || !caseRecord || prev.id !== caseRecord.id) {
      return;
    }

    for (const slot of caseRecord.slots) {
      if (!slot.clientUpload || !isSlotRejected(slot) || !slot.rejection) {
        continue;
      }
      const prevSlot = prev.slots.find((s) => s.id === slot.id);
      const rejectedAt = slot.rejection.rejectedAt;
      if (prevSlot && isSlotRejected(prevSlot)) {
        const prevAt = prevSlot.rejection?.rejectedAt;
        if (prevAt === rejectedAt) {
          continue;
        }
      }
      if (notifiedRejectionAtRef.current[slot.id] === rejectedAt) {
        continue;
      }
      notifiedRejectionAtRef.current[slot.id] = rejectedAt;
      toast.warning("Your adviser needs a new file", {
        description: `${slot.targetFileName}: ${slot.rejection.message}`,
      });
    }
  }, [caseRecord]);
}
