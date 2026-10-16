import type { Case, Slot } from "@/lib/types";

function extensionFromUploadName(name: string): string {
  const parts = name.split(".");
  if (parts.length < 2) {
    return ".pdf";
  }
  const ext = parts.pop()?.toLowerCase() ?? "";
  return ext ? `.${ext}` : ".pdf";
}

/** Zip `Documents/` entry for one slot (filename only, no folder). */
export function slotDocumentZipName(slot: Slot): string {
  if (!slot.clientUpload) {
    const base =
      slot.instructionType === "cover-letter"
        ? `${slot.targetFileName}.docx`
        : `${slot.targetFileName}.pdf`;
    return `${base} (generated — adviser)`;
  }
  if (slot.upload) {
    return `${slot.targetFileName}${extensionFromUploadName(slot.upload.name)}`;
  }
  return `${slot.targetFileName}.pdf`;
}

export function getArchiveRootName(caseRecord: Case): string {
  if (caseRecord.archiveFolderName) {
    return caseRecord.archiveFolderName;
  }
  const lastName =
    caseRecord.applicantFullName.trim().split(/\s+/).pop() ?? "Applicant";
  return `${lastName}_${caseRecord.applicantFirstName}_${caseRecord.uan}_Documents`;
}

export function listDocumentZipEntries(caseRecord: Case): string[] {
  return caseRecord.slots.map((slot) => slotDocumentZipName(slot));
}

export function buildZipManifestText(caseRecord: Case): string {
  const root = getArchiveRootName(caseRecord);
  const miscName =
    caseRecord.checklistFileName ?? "Submitted checklist.pdf";

  const documentLines = caseRecord.slots.map(
    (slot) => `    ${slotDocumentZipName(slot)}`,
  );

  return [
    `${root}/`,
    "  Documents/",
    ...documentLines,
    "  Misc/",
    `    ${miscName}`,
    "",
  ].join("\n");
}

export function downloadZipManifestFile(caseRecord: Case): void {
  const text = buildZipManifestText(caseRecord);
  const root = getArchiveRootName(caseRecord);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${root}-manifest.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}
