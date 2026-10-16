import { MAX_CLIENT_FILE_BYTES } from "@/lib/constants";
import type { Slot } from "@/lib/types";
import { extensionFromFilename } from "@/lib/server/case-storage";

const MIME_BY_EXT: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".txt": ["text/plain"],
};

export function validateClientUploadFile(
  file: File,
  slot: Slot,
): string | null {
  if (file.size > MAX_CLIENT_FILE_BYTES) {
    return `File is too large (max ${Math.round(MAX_CLIENT_FILE_BYTES / (1024 * 1024))} MB).`;
  }

  const ext = extensionFromFilename(file.name);
  const allowedExts =
    slot.instructionType === "cos"
      ? [".pdf", ".jpg", ".jpeg", ".png", ".txt"]
      : [".pdf", ".jpg", ".jpeg", ".png"];

  if (!allowedExts.includes(ext)) {
    return `File type not allowed. Accepted: ${allowedExts.join(", ")}`;
  }

  const allowedMimes = MIME_BY_EXT[ext] ?? [];
  if (file.type && !allowedMimes.includes(file.type)) {
    return "File type does not match extension.";
  }

  return null;
}

export function validateClientUploadBuffer(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  slot: Slot,
): string | null {
  if (buffer.length > MAX_CLIENT_FILE_BYTES) {
    return `File is too large (max ${Math.round(MAX_CLIENT_FILE_BYTES / (1024 * 1024))} MB).`;
  }
  const fakeFile = {
    name: originalName,
    size: buffer.length,
    type: mimeType,
  } as File;
  return validateClientUploadFile(fakeFile, slot);
}
