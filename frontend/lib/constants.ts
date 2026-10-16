import { getFirmBranding } from "@/lib/firm-branding";

/** Display name for the immigration firm (configurable via `NEXT_PUBLIC_FIRM_NAME`). */
export const FIRM_NAME = getFirmBranding().name;

/** Client upload limit (PRODUCT-SPEC §11). Vercel serverless body ~4.5 MB — cap on Vercel. */
export const MAX_CLIENT_FILE_BYTES =
  Number(process.env.NEXT_PUBLIC_MAX_CLIENT_FILE_BYTES) ||
  (process.env.VERCEL ? 4 * 1024 * 1024 : 7 * 1024 * 1024);

/** Staff checklist PDF upload (PRODUCT-SPEC §11). */
export const MAX_STAFF_CHECKLIST_BYTES = 15 * 1024 * 1024;

export const MOCK_PARSE_DELAY_MS = 1500;
