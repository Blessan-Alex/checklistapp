import { getFirmBranding } from "@/lib/firm-branding";

/** App display name (configurable via `NEXT_PUBLIC_FIRM_NAME`). */
export const FIRM_NAME = getFirmBranding().name;

/** Client upload limit. Use direct Blob uploads on Vercel for full 7 MB. */
export const MAX_CLIENT_FILE_BYTES =
  Number(process.env.NEXT_PUBLIC_MAX_CLIENT_FILE_BYTES) ||
  7 * 1024 * 1024;

/** Browser uploads directly to Blob when true (set on Vercel with BLOB_READ_WRITE_TOKEN). */
export const USE_CLIENT_BLOB_UPLOADS =
  process.env.NEXT_PUBLIC_USE_BLOB_UPLOADS === "true";

/** Vercel serverless request body limit (~4.5 MB) for multipart uploads. */
export const VERCEL_MULTIPART_MAX_BYTES = 4 * 1024 * 1024;

/** Max bytes the client may send on the current upload path (blob vs multipart). */
export function getEffectiveClientUploadMaxBytes(): number {
  if (USE_CLIENT_BLOB_UPLOADS) {
    return MAX_CLIENT_FILE_BYTES;
  }
  const onVercel = process.env.VERCEL === "1";
  if (onVercel) {
    return Math.min(MAX_CLIENT_FILE_BYTES, VERCEL_MULTIPART_MAX_BYTES);
  }
  return MAX_CLIENT_FILE_BYTES;
}

export const MAX_CLIENT_FILE_MB = Math.max(
  1,
  Math.round(MAX_CLIENT_FILE_BYTES / (1024 * 1024)),
);

export const EFFECTIVE_CLIENT_FILE_MB = Math.max(
  1,
  Math.round(getEffectiveClientUploadMaxBytes() / (1024 * 1024)),
);

/** Staff checklist PDF upload. */
export const MAX_STAFF_CHECKLIST_BYTES = 15 * 1024 * 1024;
