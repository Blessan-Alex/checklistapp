import type { Case, Route } from "@/lib/types";
import { caseIdFromUan } from "@/lib/case-from-parsed-checklist";
import { classifyChecklistRoute } from "@/lib/checklist-route";
import { ChecklistParseError } from "@/lib/checklist-parse-errors";

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
 * Mock-only: filename heuristics for demo PDFs (browser mock store).
 * Real API uploads use `parseChecklistPdf` on the server.
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

  if (lower.includes("ilr") || lower.includes("set (o)") || lower.includes("set(o)")) {
    const productLine = "Set (O) — ILR";
    const route = classifyChecklistRoute(productLine, fileName);
    const uan = "1212-0001-9999-0001";
    return {
      caseId: caseIdFromUan(uan),
      suggestedRoute: route,
      uan,
      applicantFullName: "Demo ILR Applicant",
      applicantFirstName: "Demo",
      title: "Mr",
      submittedDate: new Date().toISOString().slice(0, 10),
      productLine,
      parseConfidence: "low",
    };
  }

  if (
    lower.includes("skilled") ||
    lower.includes("worker") ||
    lower.includes("pbs")
  ) {
    const productLine = "PBS — Skilled Worker";
    const route = classifyChecklistRoute(productLine, fileName);
    const uan = "1212-0001-9999-0002";
    return {
      caseId: caseIdFromUan(uan),
      suggestedRoute: route,
      uan,
      applicantFullName: "Demo Skilled Worker Applicant",
      applicantFirstName: "Demo",
      title: "Mr",
      submittedDate: new Date().toISOString().slice(0, 10),
      productLine,
      parseConfidence: "low",
    };
  }

  throw new ChecklistParseError(
    "Could not match this filename to a demo checklist. Name the file with skilled worker / ILR hints, or use dino/sophy for demo cases. In production, upload the real UKVI checklist PDF.",
  );
}
