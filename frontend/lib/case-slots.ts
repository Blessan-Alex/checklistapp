import { instructionForType } from "@/lib/instructions-registry";
import { routeSlotConfig } from "@/lib/route-config";
import { buildSlotsFromRouteConfig } from "@/lib/slot-builder";
import type { Case, Slot } from "@/lib/types";

/** Partner / dependant rows hidden when `dependantPack` is off (SLOT-TEMPLATES). */
export const SKILLED_WORKER_PARTNER_SLOT_IDS = new Set([
  "sw-04-passport-partner",
  "sw-06-marriage-certificate",
  "sw-08-evisa-partner",
  "sw-08-sharecode-partner",
  "sw-09-brp-partner",
]);

export function mergeSlotUploads(
  nextSlots: Slot[],
  previousSlots: Slot[],
): Slot[] {
  const previousById = new Map(previousSlots.map((slot) => [slot.id, slot]));

  return nextSlots.map((slot) => {
    const prev = previousById.get(slot.id);
    const upload = prev?.upload;
    const rejection = prev?.rejection;
    if (upload || rejection) {
      return { ...slot, ...(upload ? { upload } : {}), ...(rejection ? { rejection } : {}) };
    }
    return slot;
  });
}

export function applyDependantPackFilter(
  slots: Slot[],
  dependantPack: boolean,
): Slot[] {
  if (dependantPack) {
    return slots;
  }
  return slots.filter((slot) => !SKILLED_WORKER_PARTNER_SLOT_IDS.has(slot.id));
}

export function rebuildCaseSlots(
  caseRecord: Pick<
    Case,
    | "route"
    | "applicantFirstName"
    | "partnerFirstName"
    | "dependantPack"
  >,
  previousSlots: Slot[] = [],
): Slot[] {
  const config = routeSlotConfig(caseRecord.route);
  const built = buildSlotsFromRouteConfig(
    config,
    {
      route: caseRecord.route,
      applicantFirstName: caseRecord.applicantFirstName,
      partnerFirstName: caseRecord.partnerFirstName,
    },
    (type) => instructionForType(type),
  );

  let slots = built;
  if (caseRecord.route === "skilled_worker") {
    slots = applyDependantPackFilter(slots, caseRecord.dependantPack);
  }

  const manualSlots = previousSlots.filter((slot) => slot.source === "manual");
  const combined = [...slots, ...manualSlots].sort(
    (a, b) =>
      a.sortNumber - b.sortNumber ||
      a.documentName.localeCompare(b.documentName),
  );

  return mergeSlotUploads(combined, previousSlots);
}
