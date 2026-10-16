import type { Slot } from "@/lib/types";

export function isSlotRejected(slot: Slot): boolean {
  return Boolean(slot.rejection?.message);
}

/** Client may upload a replacement when the portal is open and the slot needs one. */
export function slotNeedsClientReplacement(slot: Slot): boolean {
  return slot.clientUpload && isSlotRejected(slot);
}

export function isClientSlotComplete(slot: Slot): boolean {
  if (!slot.clientUpload) {
    return true;
  }
  return Boolean(slot.upload) && !isSlotRejected(slot);
}
