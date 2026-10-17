import { clientUploadSlots } from "@/lib/client-portal";
import { isSlotRejected } from "@/lib/slot-status";
import type { Case, Slot } from "@/lib/types";

export function isSlotStaffApproved(slot: Slot): boolean {
  return Boolean(slot.staffApproval?.approvedAt);
}

export function slotNeedsStaffReview(slot: Slot): boolean {
  if (!slot.clientUpload) {
    return false;
  }
  if (!slot.upload || isSlotRejected(slot)) {
    return false;
  }
  return !isSlotStaffApproved(slot);
}

export function staffReviewCounts(caseRecord: Case): {
  approved: number;
  pending: number;
  rejected: number;
  missingUpload: number;
  total: number;
} {
  const clientSlots = clientUploadSlots(caseRecord.slots);
  let approved = 0;
  let pending = 0;
  let rejected = 0;
  let missingUpload = 0;

  for (const slot of clientSlots) {
    if (isSlotRejected(slot)) {
      rejected += 1;
      continue;
    }
    if (!slot.upload) {
      missingUpload += 1;
      continue;
    }
    if (isSlotStaffApproved(slot)) {
      approved += 1;
    } else {
      pending += 1;
    }
  }

  return {
    approved,
    pending,
    rejected,
    missingUpload,
    total: clientSlots.length,
  };
}

export function allClientUploadsStaffApproved(caseRecord: Case): boolean {
  const counts = staffReviewCounts(caseRecord);
  return (
    counts.total > 0 &&
    counts.pending === 0 &&
    counts.rejected === 0 &&
    counts.missingUpload === 0 &&
    counts.approved === counts.total
  );
}

export function canStaffDownloadZip(caseRecord: Case): boolean {
  return (
    caseRecord.status === "ready_to_zip" || caseRecord.status === "zip_ready"
  );
}

export function caseAwaitingStaffReview(caseRecord: Case): boolean {
  return (
    caseRecord.status === "submitted" ||
    caseRecord.status === "ready_to_zip" ||
    caseRecord.status === "zip_ready"
  );
}

export function firstPendingReviewSlotId(caseRecord: Case): string | undefined {
  return clientUploadSlots(caseRecord.slots).find((slot) =>
    slotNeedsStaffReview(slot),
  )?.id;
}
