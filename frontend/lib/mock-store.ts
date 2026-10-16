import caseDinoJson from "@/config/mock/case-dino.json";
import caseSophyJson from "@/config/mock/case-sophy.json";
import { createDinoCase, createSophyCase } from "@/lib/mock-case-factory";
import type { ParsedChecklist } from "@/lib/mock-parse";
import type { Case, MockStoreState, Slot } from "@/lib/types";
import { notifyMockStoreChanged } from "@/lib/client-portal";
import {
  countClientUploadSlots,
  countClientUploadSortGroups,
} from "@/lib/slot-builder";

export const MOCK_STORE_STORAGE_KEY = "document-portal-demo-v1";

/** In-memory cache so `useSyncExternalStore` getSnapshot stays referentially stable. */
let memoryStore: MockStoreState | null = null;

function cloneCase(caseRecord: Case): Case {
  return JSON.parse(JSON.stringify(caseRecord)) as Case;
}

function seedCases(): Case[] {
  return [cloneCase(caseDinoJson as Case), cloneCase(caseSophyJson as Case)];
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseStoredState(raw: string | null): MockStoreState | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as MockStoreState;
    if (parsed.version !== 1 || !Array.isArray(parsed.cases)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function reloadMemoryStoreFromDisk(): void {
  if (!isBrowser()) {
    return;
  }
  const existing = parseStoredState(
    window.localStorage.getItem(MOCK_STORE_STORAGE_KEY),
  );
  if (existing) {
    memoryStore = existing;
  }
}

export function loadMockStore(): MockStoreState {
  if (!isBrowser()) {
    if (!memoryStore) {
      memoryStore = { version: 1, cases: seedCases() };
    }
    return memoryStore;
  }

  if (memoryStore) {
    return memoryStore;
  }

  reloadMemoryStoreFromDisk();
  if (memoryStore) {
    return memoryStore;
  }

  const initial: MockStoreState = { version: 1, cases: seedCases() };
  saveMockStore(initial);
  return initial;
}

export function saveMockStore(state: MockStoreState): void {
  memoryStore = state;
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(MOCK_STORE_STORAGE_KEY, JSON.stringify(state));
}

/** Called when another tab updates localStorage. */
export function syncMockStoreFromDisk(): void {
  reloadMemoryStoreFromDisk();
}

export function resetMockStore(): MockStoreState {
  const fresh: MockStoreState = { version: 1, cases: seedCases() };
  saveMockStore(fresh);
  return fresh;
}

export function getCases(): Case[] {
  return loadMockStore().cases;
}

export function getCaseById(caseId: string): Case | undefined {
  return getCases().find((c) => c.id === caseId);
}

const LEGACY_CLIENT_TOKENS: Record<string, string> = {
  "demo-dino-sw": "case-dino",
  "demo-sophy-ilr": "case-sophy",
};

export function getCaseByClientToken(token: string): Case | undefined {
  const cases = getCases();
  const direct = cases.find((c) => c.clientToken === token);
  if (direct) {
    return direct;
  }
  const legacyId = LEGACY_CLIENT_TOKENS[token];
  if (legacyId) {
    return cases.find((c) => c.id === legacyId);
  }
  return undefined;
}

export function updateCase(caseId: string, patch: Partial<Case>): Case | undefined {
  const state = loadMockStore();
  const index = state.cases.findIndex((c) => c.id === caseId);
  if (index === -1) {
    return undefined;
  }
  const updated = { ...state.cases[index], ...patch };
  state.cases[index] = updated;
  saveMockStore(state);
  notifyMockStoreChanged();
  return updated;
}

export function setSlotUpload(
  caseId: string,
  slotId: string,
  upload: Slot["upload"] | undefined,
): Case | undefined {
  const state = loadMockStore();
  const caseIndex = state.cases.findIndex((c) => c.id === caseId);
  if (caseIndex === -1) {
    return undefined;
  }
  const caseRecord = state.cases[caseIndex];
  const slots = caseRecord.slots.map((slot) =>
    slot.id === slotId
      ? {
          ...slot,
          upload,
          rejection: upload ? undefined : slot.rejection,
        }
      : slot,
  );
  const updated: Case = { ...caseRecord, slots };
  state.cases[caseIndex] = updated;
  saveMockStore(state);
  notifyMockStoreChanged();
  return updated;
}

export function markClientInProgress(caseId: string): Case | undefined {
  const current = getCaseById(caseId);
  if (!current || current.status !== "live") {
    return current;
  }
  return updateCase(caseId, { status: "client_in_progress" });
}

export function submitClientCase(caseId: string): Case | undefined {
  return updateCase(caseId, {
    status: "submitted",
    updatedAt: new Date().toISOString(),
  });
}

/** Demo: fill client slots and mark submitted (Prompt 1.8). */
export function simulateClientCompleted(caseId: string): Case | undefined {
  const current = getCaseById(caseId);
  if (!current) {
    return undefined;
  }
  const uploadedAt = new Date().toISOString();
  const slots = current.slots.map((slot) => {
    if (!slot.clientUpload) {
      return slot;
    }
    const ext =
      slot.instructionType === "cos" ? ".txt" : ".pdf";
    const safeStem = slot.targetFileName.replace(/\s+/g, "-");
    return {
      ...slot,
      upload: {
        name: `${safeStem}${ext}`,
        size: 48_000,
        uploadedAt,
      },
    };
  });
  return updateCase(caseId, {
    slots,
    status: "submitted",
    updatedAt: uploadedAt,
  });
}

/** Demo: clear uploads; keep publish token and return to live when link exists. */
export function resetDemoCase(caseId: string): Case | undefined {
  const current = getCaseById(caseId);
  if (!current) {
    return undefined;
  }
  const seed = seedCases().find((c) => c.id === caseId);
  const base = seed ? cloneCase(seed) : current;
  const slots = base.slots.map((slot) => ({ ...slot, upload: undefined }));
  const status =
    current.clientToken && current.status !== "draft"
      ? "live"
      : base.status;
  return updateCase(caseId, {
    slots,
    status,
    clientToken: current.clientToken ?? base.clientToken,
    updatedAt: new Date().toISOString(),
  });
}

export function rejectClientSlotUpload(
  caseId: string,
  slotId: string,
  message: string,
): Case | undefined {
  const trimmed = message.trim();
  if (!trimmed) {
    return undefined;
  }
  const current = getCaseById(caseId);
  if (!current || current.status === "draft") {
    return undefined;
  }
  const slot = current.slots.find((s) => s.id === slotId);
  if (!slot?.clientUpload || !slot.upload) {
    return undefined;
  }
  const rejectedAt = new Date().toISOString();
  const slots = current.slots.map((s) =>
    s.id === slotId
      ? {
          ...s,
          upload: undefined,
          rejection: { message: trimmed, rejectedAt },
        }
      : s,
  );
  let status = current.status;
  if (status === "submitted" || status === "zip_ready") {
    status = "client_in_progress";
  }
  return updateCase(caseId, {
    slots,
    status,
    updatedAt: rejectedAt,
  });
}

export function reopenCaseForClient(
  caseId: string,
  note: string,
): Case | undefined {
  const trimmed = note.trim();
  if (!trimmed) {
    return undefined;
  }
  const current = getCaseById(caseId);
  if (!current) {
    return undefined;
  }
  if (current.status !== "submitted" && current.status !== "zip_ready") {
    return undefined;
  }
  const reopenedAt = new Date().toISOString();
  return updateCase(caseId, {
    status: "client_in_progress",
    lastReopen: { note: trimmed, reopenedAt },
    updatedAt: reopenedAt,
  });
}

export function markCaseZipReady(caseId: string): Case | undefined {
  const current = getCaseById(caseId);
  if (!current) {
    return undefined;
  }
  if (current.status !== "submitted" && current.status !== "zip_ready") {
    return current;
  }
  return updateCase(caseId, { status: "zip_ready" });
}

/** Replace or insert a demo case after mock checklist parse (repeatable Dino / Sophy ids). */
export function upsertCaseFromParsedChecklist(
  checklistFileName: string,
  parsed: ParsedChecklist,
  updatedAtIso: string,
): Case {
  const base =
    parsed.caseId === "case-sophy" ? createSophyCase() : createDinoCase();

  const merged: Case = {
    ...base,
    route: parsed.suggestedRoute,
    uan: parsed.uan,
    applicantFullName: parsed.applicantFullName,
    applicantFirstName: parsed.applicantFirstName,
    title: parsed.title,
    submittedDate: parsed.submittedDate,
    productLine: parsed.productLine,
    checklistFileName,
    status: "draft",
    updatedAt: updatedAtIso,
    parseConfidence: parsed.parseConfidence,
  };

  const state = loadMockStore();
  const index = state.cases.findIndex((c) => c.id === merged.id);
  if (index === -1) {
    state.cases.push(merged);
  } else {
    state.cases[index] = merged;
  }
  saveMockStore(state);
  return merged;
}

export function generateDemoClientToken(caseId: string): string {
  const slug = caseId.replace(/^case-/, "");
  return `demo-${slug}`;
}

export function saveCaseRecord(caseRecord: Case): Case {
  const state = loadMockStore();
  const index = state.cases.findIndex((c) => c.id === caseRecord.id);
  if (index === -1) {
    state.cases.push(caseRecord);
  } else {
    state.cases[index] = caseRecord;
  }
  saveMockStore(state);
  return caseRecord;
}

export function publishCase(caseId: string): Case | undefined {
  const current = getCaseById(caseId);
  if (!current) {
    return undefined;
  }
  if (
    current.status === "submitted" ||
    current.status === "zip_ready" ||
    current.status !== "draft"
  ) {
    return undefined;
  }
  const token = generateDemoClientToken(caseId);
  return updateCase(caseId, {
    status: "live",
    clientToken: token,
  });
}

/** Demo VERIFY helpers (Prompt 1.1). */
export function assertDemoCaseCounts(): {
  dinoClientUploadFiles: number;
  sophyClientUploadFiles: number;
  dinoClientUploadSortGroups: number;
  sophyClientUploadSortGroups: number;
} {
  const dino = caseDinoJson as Case;
  const sophy = caseSophyJson as Case;
  return {
    dinoClientUploadFiles: countClientUploadSlots(dino.slots),
    sophyClientUploadFiles: countClientUploadSlots(sophy.slots),
    dinoClientUploadSortGroups: countClientUploadSortGroups(dino.slots),
    sophyClientUploadSortGroups: countClientUploadSortGroups(sophy.slots),
  };
}
