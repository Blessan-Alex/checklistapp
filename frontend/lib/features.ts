/**
 * UI feature flags (Phase 4). Enable via `NEXT_PUBLIC_*` env vars.
 */
export const features = {
  oneDriveExport:
    process.env.NEXT_PUBLIC_FEATURE_ONEDRIVE_EXPORT === "true",
  /** Reserved for post-MVP (not wired in UI yet). */
  multiRoute: process.env.NEXT_PUBLIC_FEATURE_MULTI_ROUTE === "true",
  /** Reserved for post-MVP (not wired in UI yet). */
  clientPin: process.env.NEXT_PUBLIC_FEATURE_CLIENT_PIN === "true",
} as const;
