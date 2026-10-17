import {
  EFFECTIVE_CLIENT_FILE_MB,
  getEffectiveClientUploadMaxBytes,
  MAX_CLIENT_FILE_BYTES,
  MAX_CLIENT_FILE_MB,
} from "@/lib/constants";

export function clientUploadSizeError(bytes: number): string | null {
  const limit = getEffectiveClientUploadMaxBytes();
  if (bytes > limit) {
    const labelMb =
      limit === MAX_CLIENT_FILE_BYTES
        ? MAX_CLIENT_FILE_MB
        : EFFECTIVE_CLIENT_FILE_MB;
    return `File is too large (max ${labelMb} MB).`;
  }
  return null;
}

export function validateClientUploadSize(file: File): string | null {
  return clientUploadSizeError(file.size);
}
