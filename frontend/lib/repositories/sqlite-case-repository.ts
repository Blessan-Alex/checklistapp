import { randomUUID } from "node:crypto";
import { getDb, persistCase, rowToCase } from "@/lib/db/database";
import { buildCaseFromParsedChecklist } from "@/lib/case-from-parsed-checklist";
import type { ParsedChecklist } from "@/lib/checklist-parse";
import type { Case } from "@/lib/types";
import type { CaseRepository } from "./case-repository";

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
    const existing = await this.getCaseById(parsed.caseId);
    const merged = buildCaseFromParsedChecklist(
      parsed,
      checklistFileName,
      updatedAtIso,
      existing,
    );
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
      current.status === "ready_to_zip" ||
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

  async deleteCase(caseId: string): Promise<boolean> {
    const database = getDb();
    const result = database
      .prepare("DELETE FROM cases WHERE id = ?")
      .run(caseId);
    return result.changes > 0;
  }
}

export const sqliteCaseRepository = new SqliteCaseRepository();
