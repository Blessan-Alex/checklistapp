import { getServerCaseRepository } from "@/lib/server/case-repository-server";
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
          rejection: { message: trimmed, rejectedAt },
        }
      : s,
  );

  let status = caseRecord.status;
  if (status === "submitted" || status === "zip_ready") {
    status = "client_in_progress";
  }

  return repo.saveCase({
    ...caseRecord,
    status,
    slots,
    updatedAt: rejectedAt,
  });
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
  if (caseRecord.status !== "submitted" && caseRecord.status !== "zip_ready") {
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
