import { clientUploadSizeError } from "@/lib/client-upload-validation";
import { MAX_CLIENT_FILE_BYTES } from "@/lib/constants";
import {
  allClientUploadsComplete,
  canClientWriteSlot,
  isClientPortalLocked,
} from "@/lib/client-portal";
import { getCaseBlobStorage } from "@/lib/server/case-blob-storage";
import { getServerCaseRepository } from "@/lib/server/case-repository-server";
import { validateClientUploadBuffer } from "@/lib/server/client-upload-validation";
import { slotUploadBlobPathname } from "@/lib/slot-upload-pathname";
import type { Case } from "@/lib/types";

export class ClientCaseError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function getWritableClientCase(token: string): Promise<Case> {
  const repo = getServerCaseRepository();
  const caseRecord = await repo.getCaseByClientToken(token);
  if (!caseRecord || caseRecord.status === "draft") {
    throw new ClientCaseError("Not found", 404);
  }
  if (isClientPortalLocked(caseRecord)) {
    throw new ClientCaseError(
      "This checklist has already been submitted.",
      403,
    );
  }
  return caseRecord;
}

export async function assertClientCanUploadToSlot(
  token: string,
  slotId: string,
): Promise<Case> {
  const caseRecord = await getClientCaseForPortal(token);
  const slot = caseRecord.slots.find((s) => s.id === slotId);
  if (!slot?.clientUpload) {
    throw new ClientCaseError("This document slot is not available.", 404);
  }
  if (!canClientWriteSlot(caseRecord, slot)) {
    throw new ClientCaseError(
      "Uploads are closed for this checklist except where your adviser asked for an updated file.",
      403,
    );
  }
  return caseRecord;
}

export async function getClientCaseForPortal(token: string): Promise<Case> {
  const repo = getServerCaseRepository();
  const caseRecord = await repo.getCaseByClientToken(token);
  if (!caseRecord || caseRecord.status === "draft") {
    throw new ClientCaseError("Not found", 404);
  }
  return caseRecord;
}

export function expectedSlotUploadPathname(
  caseRecord: Case,
  slotId: string,
  originalName: string,
): string {
  return slotUploadBlobPathname(caseRecord.id, slotId, originalName);
}

export async function attachClientSlotUploadMetadata(
  token: string,
  slotId: string,
  originalName: string,
  sizeBytes: number,
  uploadedAt?: string,
): Promise<Case> {
  const repo = getServerCaseRepository();
  const caseRecord = await assertClientCanUploadToSlot(token, slotId);

  const sizeError = clientUploadSizeError(sizeBytes);
  if (sizeError) {
    throw new ClientCaseError(sizeError, 413);
  }

  const at = uploadedAt ?? new Date().toISOString();
  const slots = caseRecord.slots.map((s) =>
    s.id === slotId
      ? {
          ...s,
          rejection: undefined,
          staffApproval: undefined,
          upload: {
            name: originalName,
            size: sizeBytes,
            uploadedAt: at,
          },
        }
      : s,
  );

  let status = caseRecord.status;
  if (status === "live") {
    status = "client_in_progress";
  }

  return repo.saveCase({
    ...caseRecord,
    status,
    slots,
    updatedAt: at,
  });
}

export async function saveClientSlotUpload(
  token: string,
  slotId: string,
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<Case> {
  const caseRecord = await assertClientCanUploadToSlot(token, slotId);

  const validationError = validateClientUploadBuffer(
    buffer,
    originalName,
    mimeType,
  );
  if (validationError) {
    const status =
      buffer.length > MAX_CLIENT_FILE_BYTES ? 413 : 400;
    throw new ClientCaseError(validationError, status);
  }

  await getCaseBlobStorage().writeSlotUpload(
    caseRecord.id,
    slotId,
    originalName,
    buffer,
  );

  return attachClientSlotUploadMetadata(
    token,
    slotId,
    originalName,
    buffer.length,
  );
}

/** After a direct Blob upload, persist metadata only if bytes exist in storage. */
export async function confirmClientSlotUploadAfterStorage(
  token: string,
  slotId: string,
  originalName: string,
  uploadedAt?: string,
): Promise<Case> {
  const caseRecord = await assertClientCanUploadToSlot(token, slotId);
  const buffer = await getCaseBlobStorage().readSlotUpload(
    caseRecord.id,
    slotId,
    originalName,
  );
  if (!buffer || buffer.length === 0) {
    throw new ClientCaseError(
      "We could not find your file yet. Wait a moment and tap Retry upload.",
      400,
    );
  }
  return attachClientSlotUploadMetadata(
    token,
    slotId,
    originalName,
    buffer.length,
    uploadedAt,
  );
}

export async function submitClientCaseByToken(token: string): Promise<Case> {
  const repo = getServerCaseRepository();
  const caseRecord = await getWritableClientCase(token);
  if (!allClientUploadsComplete(caseRecord)) {
    throw new ClientCaseError(
      "Upload every required document before submitting.",
      400,
    );
  }
  return repo.saveCase({
    ...caseRecord,
    status: "submitted",
    updatedAt: new Date().toISOString(),
  });
}
