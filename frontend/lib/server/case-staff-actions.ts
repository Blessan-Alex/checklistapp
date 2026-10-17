import { allClientUploadsStaffApproved } from "@/lib/staff-review";
import { getServerCaseRepository } from "@/lib/server/case-repository-server";
import { isSlotRejected } from "@/lib/slot-status";
import type { Case } from "@/lib/types";

export class CaseStaffActionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function rejectClientSlotUpload(
  caseId: string,
  slotId: string,
  message: string,
): Promise<Case> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new CaseStaffActionError("Rejection message is required", 400);
  }

  const repo = getServerCaseRepository();
  const caseRecord = await repo.getCaseById(caseId);
  if (!caseRecord) {
    throw new CaseStaffActionError("Not found", 404);
  }
  if (caseRecord.status === "draft") {
    throw new CaseStaffActionError("Publish the case before reviewing uploads", 400);
  }
  if (!caseAwaitingStaffReviewStatus(caseRecord.status)) {
    throw new CaseStaffActionError(
      "Review is available after the client submits",
      400,
    );
  }
  if (caseRecord.status !== "submitted") {
    throw new CaseStaffActionError(
      "Reject documents while the pack is in review, before it is marked ready",
      400,
    );
  }

  const slot = caseRecord.slots.find((s) => s.id === slotId);
  if (!slot || !slot.clientUpload) {
    throw new CaseStaffActionError("Invalid slot", 404);
  }
  if (!slot.upload) {
    throw new CaseStaffActionError("No upload on this slot yet", 400);
  }

  const rejectedAt = new Date().toISOString();
  const slots = caseRecord.slots.map((s) =>
    s.id === slotId
      ? {
          ...s,
          upload: undefined,
          staffApproval: undefined,
          rejection: { message: trimmed, rejectedAt },
        }
      : s,
  );

  return repo.saveCase({
    ...caseRecord,
    slots,
    updatedAt: rejectedAt,
  });
}

export async function approveClientSlotUpload(
  caseId: string,
  slotId: string,
): Promise<Case> {
  const repo = getServerCaseRepository();
  const caseRecord = await repo.getCaseById(caseId);
  if (!caseRecord) {
    throw new CaseStaffActionError("Not found", 404);
  }
  if (!caseAwaitingStaffReviewStatus(caseRecord.status)) {
    throw new CaseStaffActionError(
      "Review is available after the client submits",
      400,
    );
  }

  const slot = caseRecord.slots.find((s) => s.id === slotId);
  if (!slot || !slot.clientUpload) {
    throw new CaseStaffActionError("Invalid slot", 404);
  }
  if (!slot.upload) {
    throw new CaseStaffActionError("No upload on this slot yet", 400);
  }
  if (isSlotRejected(slot)) {
    throw new CaseStaffActionError(
      "Client must upload a replacement before approval",
      400,
    );
  }

  const approvedAt = new Date().toISOString();
  const slots = caseRecord.slots.map((s) =>
    s.id === slotId
      ? {
          ...s,
          staffApproval: { approvedAt },
          rejection: undefined,
        }
      : s,
  );

  const status =
    caseRecord.status === "ready_to_zip" || caseRecord.status === "zip_ready"
      ? caseRecord.status
      : "submitted";

  return repo.saveCase({
    ...caseRecord,
    status,
    slots,
    updatedAt: approvedAt,
  });
}

export async function completeStaffPackReview(caseId: string): Promise<Case> {
  const repo = getServerCaseRepository();
  const caseRecord = await repo.getCaseById(caseId);
  if (!caseRecord) {
    throw new CaseStaffActionError("Not found", 404);
  }
  if (caseRecord.status === "ready_to_zip" || caseRecord.status === "zip_ready") {
    return caseRecord;
  }
  if (caseRecord.status !== "submitted") {
    throw new CaseStaffActionError(
      "Complete review after the client has submitted",
      400,
    );
  }
  if (!allClientUploadsStaffApproved(caseRecord)) {
    throw new CaseStaffActionError(
      "Approve every client document before finishing review",
      400,
    );
  }

  const updatedAt = new Date().toISOString();
  return repo.saveCase({
    ...caseRecord,
    status: "ready_to_zip",
    updatedAt,
  });
}

function caseAwaitingStaffReviewStatus(status: Case["status"]): boolean {
  return (
    status === "submitted" ||
    status === "ready_to_zip" ||
    status === "zip_ready"
  );
}

export async function reopenCaseForClient(
  caseId: string,
  note: string,
): Promise<Case> {
  const trimmed = note.trim();
  if (!trimmed) {
    throw new CaseStaffActionError("Reopen note is required", 400);
  }

  const repo = getServerCaseRepository();
  const caseRecord = await repo.getCaseById(caseId);
  if (!caseRecord) {
    throw new CaseStaffActionError("Not found", 404);
  }
  if (
    caseRecord.status !== "submitted" &&
    caseRecord.status !== "ready_to_zip" &&
    caseRecord.status !== "zip_ready"
  ) {
    throw new CaseStaffActionError(
      "Only submitted cases can be reopened for the client",
      400,
    );
  }

  const reopenedAt = new Date().toISOString();
  return repo.saveCase({
    ...caseRecord,
    status: "client_in_progress",
    lastReopen: { note: trimmed, reopenedAt },
    updatedAt: reopenedAt,
  });
}
