/**
 * Optional UI features. Enable via `NEXT_PUBLIC_FEATURE_ONEDRIVE_EXPORT=true`.
 */
export const features = {
  oneDriveExport:
    process.env.NEXT_PUBLIC_FEATURE_ONEDRIVE_EXPORT === "true",
};
