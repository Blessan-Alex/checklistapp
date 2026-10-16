import type { Case, Slot } from "@/lib/types";

export function checklistMentionsPreviousPassports(
  extract?: string,
): boolean {
  if (!extract) {
    return false;
  }
  return /previous\s+passports?/i.test(extract);
}

export function caseHasPreviousPassportsSlot(slots: Slot[]): boolean {
  return slots.some((slot) =>
    /previous\s+passports?/i.test(slot.documentName),
  );
}

export function showPreviousPassportsSuggestion(caseRecord: Case): boolean {
  if (caseRecord.route !== "ilr") {
    return false;
  }
  if (!checklistMentionsPreviousPassports(caseRecord.checklistExtract)) {
    return false;
  }
  return !caseHasPreviousPassportsSlot(caseRecord.slots);
}
