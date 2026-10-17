import { randomUUID } from "node:crypto";
import { buildCaseFromParsedChecklist } from "@/lib/case-from-parsed-checklist";
import type { ParsedChecklist } from "@/lib/checklist-parse";
import { getFirebaseFirestore } from "@/lib/server/firebase-admin";
import { stripUndefined } from "@/lib/server/firestore-sanitize";
import type { Case } from "@/lib/types";
import type { CaseRepository } from "./case-repository";

const COLLECTION = "portal_cases";

type CaseDoc = {
  case: Case;
  clientToken: string | null;
  updatedAt: string;
};

function toFirestoreDoc(caseRecord: Case, updatedAt: string): CaseDoc {
  return stripUndefined({
    case: stripUndefined({ ...caseRecord, updatedAt }),
    clientToken: caseRecord.clientToken ?? null,
    updatedAt,
  });
}

function docToCase(data: CaseDoc): Case {
  const caseRecord = data.case;
  if (data.clientToken) {
    caseRecord.clientToken = data.clientToken;
  }
  caseRecord.updatedAt = data.updatedAt;
  return caseRecord;
}

export class FirestoreCaseRepository implements CaseRepository {
  async listCases(): Promise<Case[]> {
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
    return undefined;
  }

  async saveCase(caseRecord: Case): Promise<Case> {
    const updatedAt = new Date().toISOString();
    const updated: Case = {
      ...caseRecord,
      updatedAt,
    };
    const db = getFirebaseFirestore();
    await db
      .collection(COLLECTION)
      .doc(updated.id)
      .set(toFirestoreDoc(updated, updatedAt));
    return updated;
  }

  async upsertFromParsedChecklist(
    checklistFileName: string,
    parsed: ParsedChecklist,
    updatedAtIso: string,
  ): Promise<Case> {
    const existing = await this.getCaseById(parsed.caseId);
    const merged = buildCaseFromParsedChecklist(
      parsed,
      checklistFileName,
      updatedAtIso,
      existing,
    );
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
      current.status === "ready_to_zip" ||
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

  async deleteCase(caseId: string): Promise<boolean> {
    const db = getFirebaseFirestore();
    const ref = db.collection(COLLECTION).doc(caseId);
    const doc = await ref.get();
    if (!doc.exists) {
      return false;
    }
    await ref.delete();
    return true;
  }
}

export const firestoreCaseRepository = new FirestoreCaseRepository();
