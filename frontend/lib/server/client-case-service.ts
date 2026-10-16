import { MAX_CLIENT_FILE_BYTES } from "@/lib/constants";
import { allClientUploadsComplete, isClientPortalLocked } from "@/lib/client-portal";
import { getCaseBlobStorage } from "@/lib/server/case-blob-storage";
import { getServerCaseRepository } from "@/lib/server/case-repository-server";
import { validateClientUploadBuffer } from "@/lib/server/client-upload-validation";
import type { Case } from "@/lib/types";

export class ClientCaseError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function getWritableClientCase(token: string): Promise<Case> {
  const repo = getServerCaseRepository();
  const caseRecord = await repo.getCaseByClientToken(token);
  if (!caseRecord || caseRecord.status === "draft") {
    throw new ClientCaseError("Not found", 404);
  }
  if (isClientPortalLocked(caseRecord)) {
    throw new ClientCaseError("This checklist is locked after submission.", 403);
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

export async function saveClientSlotUpload(
  token: string,
  slotId: string,
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<Case> {
  const repo = getServerCaseRepository();
  const caseRecord = await getWritableClientCase(token);
  const slot = caseRecord.slots.find((s) => s.id === slotId);
  if (!slot || !slot.clientUpload) {
    throw new ClientCaseError("Invalid slot", 404);
  }

  const validationError = validateClientUploadBuffer(
    buffer,
    originalName,
    mimeType,
    slot,
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

  const uploadedAt = new Date().toISOString();
  const slots = caseRecord.slots.map((s) =>
    s.id === slotId
      ? {
          ...s,
          rejection: undefined,
          upload: {
            name: originalName,
            size: buffer.length,
            uploadedAt,
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
    updatedAt: uploadedAt,
  });
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
