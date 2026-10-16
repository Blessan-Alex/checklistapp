import { instructionForType } from "@/lib/instructions-registry";
import { getSampleUrlForInstructionType } from "@/lib/slot-instructions";
import { buildTargetFileName } from "@/lib/target-filename";
import type { Case, Slot } from "@/lib/types";

export const HO_CONSENT_BLANK_PDF = "/templates/home-office-consent-blank.pdf";

function newManualSlotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `manual-${crypto.randomUUID()}`;
  }
  return `manual-${Date.now()}`;
}

export interface AddManualSlotInput {
  sortNumber: number;
  documentName: string;
  personFirstName?: string;
  instructions?: string;
  instructionType?: string;
}

function nextManualSortNumber(slots: Slot[]): number {
  const max = slots.reduce((m, s) => Math.max(m, s.sortNumber), 0);
  return max + 1;
}

export function createManualSlot(
  caseRecord: Case,
  input: AddManualSlotInput,
): Slot {
  const instructionType = input.instructionType ?? "passport";
  const { instructions: defaultInstructions, donts } =
    instructionForType(instructionType);
  const personFirstName =
    input.personFirstName?.trim() || caseRecord.applicantFirstName;

  const sortNumber =
    input.sortNumber > 0 ? input.sortNumber : nextManualSortNumber(caseRecord.slots);

  const slot: Slot = {
    id: newManualSlotId(),
    sortNumber,
    documentName: input.documentName.trim(),
    personFirstName,
    targetFileName: buildTargetFileName({
      route: caseRecord.route,
      sortNumber,
      documentName: input.documentName.trim(),
      personFirstName,
    }),
    source: "manual",
    clientUpload: true,
    instructionType,
    instructions: input.instructions?.trim() || defaultInstructions,
    donts,
    sampleUrl: getSampleUrlForInstructionType(instructionType, true),
    downloadUrl:
      instructionType === "ho-consent" ? HO_CONSENT_BLANK_PDF : undefined,
  };

  return slot;
}

export function createSuggestedPreviousPassportsSlot(caseRecord: Case): Slot {
  return createManualSlot(caseRecord, {
    sortNumber: nextManualSortNumber(caseRecord.slots),
    documentName: "Previous passports",
    personFirstName: caseRecord.applicantFirstName,
    instructionType: "passport",
    instructions: instructionForType("passport").instructions,
  });
}
