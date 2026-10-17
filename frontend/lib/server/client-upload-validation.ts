import { MAX_CLIENT_FILE_BYTES } from "@/lib/constants";
import { clientUploadSizeError } from "@/lib/client-upload-validation";

export function validateClientUploadFile(file: File): string | null {
  return clientUploadSizeError(file.size);
}

export function validateClientUploadBuffer(
  buffer: Buffer,
  _originalName: string,
  _mimeType: string,
): string | null {
  if (buffer.length > MAX_CLIENT_FILE_BYTES) {
    return clientUploadSizeError(buffer.length);
  }
  return null;
}
