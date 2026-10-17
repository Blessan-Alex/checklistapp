import type { Case, Slot } from "@/lib/types";
import { isClientSlotComplete } from "@/lib/slot-status";
import { syncMockStoreFromDisk } from "@/lib/mock-store";

export const MOCK_STORE_CHANGED_EVENT = "mock-store-changed";

export function notifyMockStoreChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MOCK_STORE_CHANGED_EVENT));
  }
}

/** Subscribe to mock store updates (localStorage + in-tab events). */
export function subscribeMockStore(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => onStoreChange();
  const onStorage = () => {
    syncMockStoreFromDisk();
    onStoreChange();
  };
  window.addEventListener(MOCK_STORE_CHANGED_EVENT, handler);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(MOCK_STORE_CHANGED_EVENT, handler);
    window.removeEventListener("storage", onStorage);
  };
}

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
