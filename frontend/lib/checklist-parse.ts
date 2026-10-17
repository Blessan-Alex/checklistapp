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
