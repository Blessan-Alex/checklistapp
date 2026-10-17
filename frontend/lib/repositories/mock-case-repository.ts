import type { ParsedChecklist } from "@/lib/mock-parse";
import {
  deleteCaseRecord,
  getCaseByClientToken,
  getCaseById,
  getCases,
  publishCase as mockPublish,
  saveCaseRecord,
  upsertCaseFromParsedChecklist,
} from "@/lib/mock-store";
import { generateDemoClientToken } from "@/lib/mock-store";
import type { Case } from "@/lib/types";
import type { CaseRepository } from "./case-repository";

/** Phase 1 localStorage-backed repository (tests + mock data source). */
export class MockCaseRepository implements CaseRepository {
  async listCases(): Promise<Case[]> {
    return getCases();
  }

  async getCaseById(caseId: string): Promise<Case | undefined> {
    return getCaseById(caseId);
  }

  async getCaseByClientToken(token: string): Promise<Case | undefined> {
    return getCaseByClientToken(token);
  }

  async saveCase(caseRecord: Case): Promise<Case> {
    return saveCaseRecord(caseRecord);
  }

  async upsertFromParsedChecklist(
    checklistFileName: string,
    parsed: ParsedChecklist,
    updatedAtIso: string,
  ): Promise<Case> {
    return upsertCaseFromParsedChecklist(
      checklistFileName,
      parsed,
      updatedAtIso,
    );
  }

  async publishCase(
    caseId: string,
    clientToken?: string,
  ): Promise<Case | undefined> {
    void clientToken;
    return mockPublish(caseId);
  }

  async deleteCase(caseId: string): Promise<boolean> {
    return deleteCaseRecord(caseId);
  }

  /** Demo tokens (`demo-dino`) — API mode uses UUIDs instead. */
  demoTokenForCase(caseId: string): string {
    return generateDemoClientToken(caseId);
  }
}

export const mockCaseRepository = new MockCaseRepository();
