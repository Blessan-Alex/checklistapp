import { randomUUID } from "node:crypto";
import { getDb, persistCase, rowToCase } from "@/lib/db/database";
import { createDinoCase, createSophyCase } from "@/lib/mock-case-factory";
import type { ParsedChecklist } from "@/lib/mock-parse";
import type { Case } from "@/lib/types";
import type { CaseRepository } from "./case-repository";
import { LEGACY_CLIENT_TOKENS } from "./legacy-client-tokens";

export class SqliteCaseRepository implements CaseRepository {
  async listCases(): Promise<Case[]> {
    const database = getDb();
    const rows = database
      .prepare("SELECT data_json, client_token FROM cases ORDER BY updated_at DESC")
      .all() as { data_json: string; client_token: string | null }[];
    return rows.map(rowToCase);
  }

  async getCaseById(caseId: string): Promise<Case | undefined> {
    const database = getDb();
    const row = database
      .prepare(
        "SELECT data_json, client_token FROM cases WHERE id = ? LIMIT 1",
      )
      .get(caseId) as { data_json: string; client_token: string | null } | undefined;
    return row ? rowToCase(row) : undefined;
  }

  async getCaseByClientToken(token: string): Promise<Case | undefined> {
    const database = getDb();
    const row = database
      .prepare(
        "SELECT data_json, client_token FROM cases WHERE client_token = ? LIMIT 1",
      )
      .get(token) as { data_json: string; client_token: string | null } | undefined;
    if (!row) {
      const legacyId = LEGACY_CLIENT_TOKENS[token];
      if (legacyId) {
        return this.getCaseById(legacyId);
      }
    }
    return row ? rowToCase(row) : undefined;
  }

  async saveCase(caseRecord: Case): Promise<Case> {
    const updated: Case = {
      ...caseRecord,
      updatedAt: new Date().toISOString(),
    };
    persistCase(getDb(), updated);
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

    persistCase(getDb(), merged);
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
    const updated: Case = {
      ...current,
      status: "live",
      clientToken: token,
      updatedAt: new Date().toISOString(),
    };
    persistCase(getDb(), updated);
    return updated;
  }
}

export const sqliteCaseRepository = new SqliteCaseRepository();
