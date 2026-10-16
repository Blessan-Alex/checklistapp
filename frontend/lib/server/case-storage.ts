import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getStoragePath } from "@/lib/server/env";

export function caseRootDir(caseId: string): string {
  return join(getStoragePath(), "cases", caseId);
}

export function slotUploadPath(
  caseId: string,
  slotId: string,
  extension: string,
): string {
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return join(caseRootDir(caseId), "uploads", `${slotId}${ext}`);
}

export function extensionFromFilename(name: string): string {
  const parts = name.split(".");
  if (parts.length < 2) {
    return ".pdf";
  }
  const ext = parts.pop()?.toLowerCase() ?? "pdf";
  return ext.startsWith(".") ? ext : `.${ext}`;
}

export function resolveChecklistPath(
  caseId: string,
  checklistFileName?: string,
): string | undefined {
  const root = caseRootDir(caseId);
  if (!existsSync(root)) {
    return undefined;
  }
  if (checklistFileName) {
    const direct = join(root, checklistFileName.replace(/[^\w.\-() ]+/g, "_"));
    if (existsSync(direct)) {
      return direct;
    }
  }
  const pdfs = readdirSync(root).filter((f) => f.toLowerCase().endsWith(".pdf"));
  return pdfs[0] ? join(root, pdfs[0]) : undefined;
}
