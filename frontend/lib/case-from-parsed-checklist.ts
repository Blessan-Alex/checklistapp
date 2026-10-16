import { rebuildCaseSlots } from "@/lib/case-slots";
import type { ParsedChecklist } from "@/lib/mock-parse";
import { getArchiveRootName } from "@/lib/zip-manifest";
import type { Case, Route } from "@/lib/types";

/** Stable Firestore / API case id from UAN (re-upload updates same case). */
export function caseIdFromUan(uan: string): string {
  return `case-${uan}`;
}

function inferDependantPack(route: Route, productLine: string): boolean {
  if (route !== "skilled_worker") {
    return false;
  }
  return /dependant|dependent|partner|spouse/i.test(productLine);
}

function buildTitleFromFullName(fullName: string): Case["title"] {
  const lower = fullName.toLowerCase();
  if (lower.startsWith("mrs ")) return "Mrs";
  if (lower.startsWith("ms ")) return "Ms";
  if (lower.startsWith("miss ")) return "Miss";
  return "Mr";
}

/**
 * Build a draft case from parsed checklist fields + route slot templates (not Dino/Sophy demos).
 */
export function buildCaseFromParsedChecklist(
  parsed: ParsedChecklist,
  checklistFileName: string,
  updatedAtIso: string,
  existing?: Case,
): Case {
  const route = parsed.suggestedRoute;
  const dependantPack =
    existing?.dependantPack ?? inferDependantPack(route, parsed.productLine);

  const draftCore = {
    route,
    applicantFirstName: parsed.applicantFirstName,
    partnerFirstName: existing?.partnerFirstName,
    dependantPack,
  };

  const slots = rebuildCaseSlots(draftCore, existing?.slots ?? []);

  const partial: Case = {
    id: parsed.caseId,
    status: "draft",
    route,
    uan: parsed.uan,
    applicantFullName: parsed.applicantFullName,
    applicantFirstName: parsed.applicantFirstName,
    title: parsed.title ?? buildTitleFromFullName(parsed.applicantFullName),
    submittedDate: parsed.submittedDate,
    productLine: parsed.productLine,
    checklistFileName,
    dependantPack,
    partnerFirstName: existing?.partnerFirstName,
    partnerFullName: existing?.partnerFullName,
    staffNotes: existing?.staffNotes,
    coverLetter: existing?.coverLetter,
    parseConfidence: parsed.parseConfidence,
    checklistExtract: parsed.checklistExtract,
    slots,
    updatedAt: updatedAtIso,
    clientToken: undefined,
  };

  partial.archiveFolderName = getArchiveRootName(partial);

  if (!existing) {
    return partial;
  }

  return {
    ...partial,
    status: "draft",
    clientToken: undefined,
    partnerFirstName: existing.partnerFirstName,
    partnerFullName: existing.partnerFullName,
    staffNotes: existing.staffNotes,
    coverLetter: existing.coverLetter,
    dependantPack: existing.dependantPack ?? dependantPack,
  };
}
