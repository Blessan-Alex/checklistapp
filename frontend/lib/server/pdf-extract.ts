import { randomUUID } from "node:crypto";
import type { Case, Route } from "@/lib/types";
import type { ParsedChecklist } from "@/lib/mock-parse";
import { parseChecklistFileName } from "@/lib/mock-parse";

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

function inferRoute(productLine: string, fileName: string): Route {
  const blob = `${productLine} ${fileName}`.toLowerCase();
  if (
    blob.includes("set (o)") ||
    blob.includes("set(o)") ||
    blob.includes("ilr")
  ) {
    return "ilr";
  }
  if (
    blob.includes("skilled worker") ||
    blob.includes("pbs") ||
    blob.includes("dependant")
  ) {
    return "skilled_worker";
  }
  return "skilled_worker";
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
    const fallback = parseChecklistFileName(fileName);
    return { ...fallback, parseConfidence: "low" };
  }

  const uanMatch = text.match(UAN_RE);
  const nameMatch = text.match(FULL_NAME_RE);
  const productMatch = text.match(PRODUCT_RE);
  const submittedMatch = text.match(SUBMITTED_RE);

  if (!uanMatch?.[1] || !nameMatch?.[1]) {
    const fallback = parseChecklistFileName(fileName);
    return { ...fallback, parseConfidence: "low" };
  }

  const applicantFullName = nameMatch[1].trim();
  const productLine = (productMatch?.[1] ?? "").trim() || "UKVI checklist";
  const submittedDate = (submittedMatch?.[1] ?? "").trim().slice(0, 10);
  const suggestedRoute = inferRoute(productLine, fileName);

  const heuristic = parseChecklistFileName(fileName);
  let caseId = `case-${randomUUID()}`;
  if (heuristic.caseId === "case-sophy" && suggestedRoute === "ilr") {
    caseId = "case-sophy";
  } else if (heuristic.caseId === "case-dino" && suggestedRoute === "skilled_worker") {
    caseId = "case-dino";
  } else if (uanMatch[1] === "1212-0001-6479-0157") {
    caseId = "case-dino";
  } else if (uanMatch[1] === "1212-0001-6466-5462") {
    caseId = "case-sophy";
  }

  return {
    caseId,
    suggestedRoute,
    uan: uanMatch[1],
    applicantFullName,
    applicantFirstName: firstNameFromFull(applicantFullName),
    title: inferTitle(applicantFullName),
    submittedDate: submittedDate || new Date().toISOString().slice(0, 10),
    productLine,
    parseConfidence: productMatch ? "high" : "low",
    checklistExtract: text.slice(0, 80_000),
  };
}
