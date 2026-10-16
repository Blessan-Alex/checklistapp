import type { Case } from "@/lib/types";
import type { ParsedChecklist } from "@/lib/mock-parse";
import { caseIdFromUan } from "@/lib/case-from-parsed-checklist";
import { classifyChecklistRoute } from "@/lib/checklist-route";
import { ChecklistParseError } from "@/lib/checklist-parse-errors";

const UAN_RE =
  /Unique Application Number:\s*(\d{4}-\d{4}-\d{4}-\d{4})/i;
const FULL_NAME_RE = /Applicant'?s full name:\s*(.+)/i;
const PRODUCT_RE = /Product name\/service:\s*(.+)/i;
const SUBMITTED_RE = /Submitted date:\s*(.+)/i;

function inferTitle(fullName: string): Case["title"] {
  const lower = fullName.toLowerCase();
  if (lower.startsWith("mrs ")) return "Mrs";
  if (lower.startsWith("ms ")) return "Ms";
  if (lower.startsWith("miss ")) return "Miss";
  return "Mr";
}

function firstNameFromFull(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const withoutTitle =
    parts[0]?.match(/^(mr|mrs|ms|miss)\.?$/i) ? parts.slice(1) : parts;
  return withoutTitle[0] ?? fullName;
}

export type PdfParseResult = ParsedChecklist & {
  parseConfidence: "high" | "low";
  checklistExtract?: string;
};

export async function parseChecklistPdf(
  buffer: Buffer,
  fileName: string,
): Promise<PdfParseResult> {
  let text = "";
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    text = parsed.text ?? "";
  } catch {
    throw new ChecklistParseError(
      "Could not read this PDF. Try a different export or re-download the checklist from UKVI.",
    );
  }

  const uanMatch = text.match(UAN_RE);
  const nameMatch = text.match(FULL_NAME_RE);
  const productMatch = text.match(PRODUCT_RE);
  const submittedMatch = text.match(SUBMITTED_RE);

  if (!uanMatch?.[1] || !nameMatch?.[1]) {
    throw new ChecklistParseError(
      "Could not find the applicant name and Unique Application Number (UAN) in this checklist. Check you uploaded the full UKVI document checklist PDF.",
    );
  }

  const applicantFullName = nameMatch[1].trim();
  const productLine = (productMatch?.[1] ?? "").trim() || "UKVI checklist";
  const submittedDate = (submittedMatch?.[1] ?? "").trim().slice(0, 10);
  const suggestedRoute = classifyChecklistRoute(productLine, fileName);
  const uan = uanMatch[1];

  return {
    caseId: caseIdFromUan(uan),
    suggestedRoute,
    uan,
    applicantFullName,
    applicantFirstName: firstNameFromFull(applicantFullName),
    title: inferTitle(applicantFullName),
    submittedDate: submittedDate || new Date().toISOString().slice(0, 10),
    productLine,
    parseConfidence: productMatch ? "high" : "low",
    checklistExtract: text.slice(0, 80_000),
  };
}
