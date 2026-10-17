import type { ParsedChecklist } from "@/lib/mock-parse";
import type { Case } from "@/lib/types";

/** Server persistence boundary (SQLite local, Firestore on Vercel). */
export interface CaseRepository {
  listCases(): Promise<Case[]>;
  getCaseById(caseId: string): Promise<Case | undefined>;
  getCaseByClientToken(token: string): Promise<Case | undefined>;
  saveCase(caseRecord: Case): Promise<Case>;
  upsertFromParsedChecklist(
    checklistFileName: string,
    parsed: ParsedChecklist,
    updatedAtIso: string,
  ): Promise<Case>;
  publishCase(caseId: string, clientToken?: string): Promise<Case | undefined>;
  deleteCase(caseId: string): Promise<boolean>;
}
