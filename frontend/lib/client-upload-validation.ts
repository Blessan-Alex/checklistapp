import { clientUploadSizeErrorMessage } from "@/lib/client-upload-user-messages";
import { getEffectiveClientUploadMaxBytes } from "@/lib/constants";

export function clientUploadSizeError(bytes: number): string | null {
  const limit = getEffectiveClientUploadMaxBytes();
  if (bytes > limit) {
    return clientUploadSizeErrorMessage(bytes);
  }
  return null;
}

export function validateClientUploadSize(file: File): string | null {
  return clientUploadSizeError(file.size);
}
