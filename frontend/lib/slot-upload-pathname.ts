/** Blob / local storage path for a slot upload (shared client + server). */
export function slotUploadBlobPathname(
  caseId: string,
  slotId: string,
  originalName: string,
): string {
  const parts = originalName.split(".");
  const ext =
    parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "pdf") : "pdf";
  const normalized = ext.startsWith(".") ? ext : `.${ext}`;
  return `cases/${caseId}/uploads/${slotId}${normalized}`;
}
