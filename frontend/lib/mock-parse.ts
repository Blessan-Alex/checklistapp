import type { Case, Route } from "@/lib/types";

export interface ParsedChecklist {
  caseId: string;
  suggestedRoute: Route;
  uan: string;
  applicantFullName: string;
  applicantFirstName: string;
  title: Case["title"];
  submittedDate: string;
  productLine: string;
  parseConfidence?: "high" | "low";
  checklistExtract?: string;
}

const DINO_PARSED: ParsedChecklist = {
  caseId: "case-dino",
  suggestedRoute: "skilled_worker",
  uan: "1212-0001-6479-0157",
  applicantFullName: "Dino Dominic",
  applicantFirstName: "Dino",
  title: "Mr",
  submittedDate: "2025-08-15",
  productLine: "PBS — dependant partner (Skilled Worker)",
};

const SOPHY_PARSED: ParsedChecklist = {
  caseId: "case-sophy",
  suggestedRoute: "ilr",
  uan: "1212-0001-6466-5462",
  applicantFullName: "Sophy Bijumon",
  applicantFirstName: "Sophy",
  title: "Mrs",
  submittedDate: "2026-09-07",
  productLine: "Set (O) — ILR",
};

/**
 * Mock checklist PDF parser (filename heuristics only until Phase 2).
 */
export function parseChecklistFileName(fileName: string): ParsedChecklist {
  const lower = fileName.toLowerCase();

  if (lower.includes("sophy") || lower.includes("bijumon")) {
    return {
      ...SOPHY_PARSED,
      parseConfidence: "high",
      checklistExtract:
        "Set (O) ILR checklist. Previous passports. Absence from UK.",
    };
  }

  if (lower.includes("dino") || lower.includes("dominic")) {
    return { ...DINO_PARSED, parseConfidence: "high" };
  }

  return { ...DINO_PARSED, parseConfidence: "low" };
}
