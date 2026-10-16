import { randomUUID } from "node:crypto";
import { createDinoCase, createSophyCase } from "@/lib/mock-case-factory";
import type { ParsedChecklist } from "@/lib/mock-parse";
import { getFirebaseFirestore } from "@/lib/server/firebase-admin";
import type { Case } from "@/lib/types";
import type { CaseRepository } from "./case-repository";
import { LEGACY_CLIENT_TOKENS } from "./legacy-client-tokens";

const COLLECTION = "portal_cases";

type CaseDoc = {
  case: Case;
  clientToken: string | null;
  updatedAt: string;
};

function docToCase(data: CaseDoc): Case {
  const caseRecord = data.case;
  if (data.clientToken) {
    caseRecord.clientToken = data.clientToken;
  }
  caseRecord.updatedAt = data.updatedAt;
  return caseRecord;
}

async function seedIfEmpty(): Promise<void> {
  const db = getFirebaseFirestore();
  const snap = await db.collection(COLLECTION).limit(1).get();
  if (!snap.empty) {
    return;
  }
  const batch = db.batch();
  const now = new Date().toISOString();
  for (const seed of [createDinoCase(), createSophyCase()]) {
    const ref = db.collection(COLLECTION).doc(seed.id);
    batch.set(ref, {
      case: seed,
      clientToken: seed.clientToken ?? null,
      updatedAt: seed.updatedAt ?? now,
    });
  }
  await batch.commit();
}

export class FirestoreCaseRepository implements CaseRepository {
  async listCases(): Promise<Case[]> {
    await seedIfEmpty();
    const db = getFirebaseFirestore();
    const snap = await db
      .collection(COLLECTION)
      .orderBy("updatedAt", "desc")
      .get();
    return snap.docs.map((doc) => docToCase(doc.data() as CaseDoc));
  }

  async getCaseById(caseId: string): Promise<Case | undefined> {
    const db = getFirebaseFirestore();
    const doc = await db.collection(COLLECTION).doc(caseId).get();
    if (!doc.exists) {
      return undefined;
    }
    return docToCase(doc.data() as CaseDoc);
  }

  async getCaseByClientToken(token: string): Promise<Case | undefined> {
    const db = getFirebaseFirestore();
    const snap = await db
      .collection(COLLECTION)
      .where("clientToken", "==", token)
      .limit(1)
      .get();
    if (!snap.empty) {
      return docToCase(snap.docs[0].data() as CaseDoc);
    }
    const legacyId = LEGACY_CLIENT_TOKENS[token];
    if (legacyId) {
      return this.getCaseById(legacyId);
    }
    return undefined;
  }

  async saveCase(caseRecord: Case): Promise<Case> {
    const updated: Case = {
      ...caseRecord,
      updatedAt: new Date().toISOString(),
    };
    const db = getFirebaseFirestore();
    await db.collection(COLLECTION).doc(updated.id).set({
      case: updated,
      clientToken: updated.clientToken ?? null,
      updatedAt: updated.updatedAt,
    });
    return updated;
  }

  async upsertFromParsedChecklist(
    checklistFileName: string,
    parsed: ParsedChecklist,
    updatedAtIso: string,
  ): Promise<Case> {
    const base =
      parsed.caseId === "case-sophy"
        ? createSophyCase()
        : parsed.caseId === "case-dino"
          ? createDinoCase()
          : createDinoCase();

    const merged: Case = {
      ...base,
      id: parsed.caseId,
      route: parsed.suggestedRoute,
      uan: parsed.uan,
      applicantFullName: parsed.applicantFullName,
      applicantFirstName: parsed.applicantFirstName,
      title: parsed.title,
      submittedDate: parsed.submittedDate,
      productLine: parsed.productLine,
      checklistFileName,
      status: "draft",
      clientToken: undefined,
      updatedAt: updatedAtIso,
      parseConfidence: parsed.parseConfidence,
      checklistExtract: parsed.checklistExtract,
    };

    await this.saveCase(merged);
    return merged;
  }

  async publishCase(
    caseId: string,
    clientToken?: string,
  ): Promise<Case | undefined> {
    const current = await this.getCaseById(caseId);
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
    const token = clientToken ?? randomUUID();
    return this.saveCase({
      ...current,
      status: "live",
      clientToken: token,
    });
  }
}

export const firestoreCaseRepository = new FirestoreCaseRepository();
