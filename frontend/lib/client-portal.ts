import type { Case, Slot } from "@/lib/types";
import { isClientSlotComplete } from "@/lib/slot-status";

export function isClientPortalLocked(caseRecord: Case): boolean {
  return (
    caseRecord.status === "submitted" ||
    caseRecord.status === "ready_to_zip" ||
    caseRecord.status === "zip_ready"
  );
}

export function clientUploadSlots(slots: Slot[]): Slot[] {
  return slots.filter((slot) => slot.clientUpload);
}

export function allClientUploadsComplete(caseRecord: Case): boolean {
  const required = clientUploadSlots(caseRecord.slots);
  return (
    required.length > 0 && required.every((slot) => isClientSlotComplete(slot))
  );
}

export function clientUploadProgress(caseRecord: Case): {
  completed: number;
  total: number;
} {
  const required = clientUploadSlots(caseRecord.slots);
  const completed = required.filter((slot) => isClientSlotComplete(slot)).length;
  return { completed, total: required.length };
}
