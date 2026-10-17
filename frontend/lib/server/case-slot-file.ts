import { getCaseBlobStorage } from "@/lib/server/case-blob-storage";
import { mimeTypeFromFilename } from "@/lib/mime-from-filename";
import type { Case, Slot } from "@/lib/types";

export class CaseSlotFileError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function readCaseSlotUploadBytes(
  caseRecord: Case,
  slotId: string,
): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
  const slot = caseRecord.slots.find((s) => s.id === slotId);
  if (!slot) {
    throw new CaseSlotFileError("Not found", 404);
  }
  if (!slot.upload?.name) {
    throw new CaseSlotFileError("No file on this slot", 404);
  }

  const buffer = await getCaseBlobStorage().readSlotUpload(
    caseRecord.id,
    slotId,
    slot.upload.name,
  );
  if (!buffer) {
    throw new CaseSlotFileError("File not found in storage", 404);
  }

  return {
    buffer,
    fileName: slot.upload.name,
    contentType: mimeTypeFromFilename(slot.upload.name),
  };
}

export async function readCaseChecklistBytes(
  caseRecord: Case,
): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
  const fileName = caseRecord.checklistFileName ?? "checklist.pdf";
  const buffer = await getCaseBlobStorage().readChecklistPdf(
    caseRecord.id,
    caseRecord.checklistFileName,
  );
  if (!buffer) {
    throw new CaseSlotFileError("Checklist file not found", 404);
  }
  return {
    buffer,
    fileName,
    contentType: mimeTypeFromFilename(fileName),
  };
}

export function clientMayViewSlotUpload(
  caseRecord: Case,
  slot: Slot,
): boolean {
  if (!slot.clientUpload || !slot.upload) {
    return false;
  }
  if (
    caseRecord.status === "submitted" ||
    caseRecord.status === "ready_to_zip" ||
    caseRecord.status === "zip_ready"
  ) {
    return true;
  }
  return false;
}
