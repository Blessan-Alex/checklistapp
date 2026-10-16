import type { Case, PersonRole, RouteSlotConfig, Slot, SlotTemplate } from "@/lib/types";
import { HO_CONSENT_BLANK_PDF } from "@/lib/add-manual-slot";
import { getSampleUrlForInstructionType } from "@/lib/slot-instructions";
import { buildTargetFileName } from "@/lib/target-filename";

export interface CaseNameContext {
  route: Case["route"];
  applicantFirstName: string;
  partnerFirstName?: string;
}

function resolvePersonFirstName(
  role: PersonRole,
  ctx: CaseNameContext,
): string | undefined {
  if (role === "applicant") {
    return ctx.applicantFirstName;
  }
  if (role === "partner") {
    return ctx.partnerFirstName;
  }
  return undefined;
}

export function slotFromTemplate(
  template: SlotTemplate,
  ctx: CaseNameContext,
  instructions: string,
  donts: string[] = [],
): Slot {
  const personFirstName = resolvePersonFirstName(template.personRole, ctx);

  return {
    id: template.id,
    sortNumber: template.sortNumber,
    documentName: template.documentName,
    personFirstName,
    targetFileName: buildTargetFileName({
      route: ctx.route,
      sortNumber: template.sortNumber,
      documentName: template.documentName,
      personFirstName,
      filenameSuffix: template.filenameSuffix,
    }),
    source: template.source,
    clientUpload: template.clientUpload,
    instructionType: template.instructionType,
    instructions,
    donts,
    sampleUrl: getSampleUrlForInstructionType(
      template.instructionType,
      template.clientUpload,
    ),
    downloadUrl:
      template.instructionType === "ho-consent"
        ? HO_CONSENT_BLANK_PDF
        : undefined,
  };
}

export function buildSlotsFromRouteConfig(
  config: RouteSlotConfig,
  ctx: CaseNameContext,
  instructionResolver: (type: string) => { instructions: string; donts: string[] },
): Slot[] {
  return config.slots.map((template) => {
    const { instructions, donts } = instructionResolver(template.instructionType);
    return slotFromTemplate(template, ctx, instructions, donts);
  });
}

export function countClientUploadSlots(slots: Slot[]): number {
  return slots.filter((s) => s.clientUpload).length;
}

/** Sort-number groups requiring client upload (excludes cover-letter tiers). */
export function countClientUploadSortGroups(slots: Slot[]): number {
  const groups = new Set(
    slots.filter((s) => s.clientUpload).map((s) => s.sortNumber),
  );
  return groups.size;
}
