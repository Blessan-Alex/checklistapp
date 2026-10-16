import pdfParse from "pdf-parse";
import type { Case } from "@/lib/types";
import type { ParsedChecklist } from "@/lib/mock-parse";
import { caseIdFromUan } from "@/lib/case-from-parsed-checklist";
import { classifyChecklistRoute } from "@/lib/checklist-route";
import { ChecklistParseError } from "@/lib/checklist-parse-errors";

const UAN_RE =
  /Unique Application Number:\s*(\d{4}-\d{4}-\d{4}-\d{4})/i;
const FULL_NAME_RE = /Applicant['\u2019]?s full name:\s*(.+)/i;
const PRODUCT_RE = /Product name\/service:\s*([^\n\r]+)/i;
const SUBMITTED_RE = /Submitted date:\s*([^\n\r]+)/i;

function normalizeChecklistText(raw: string): string {
  return raw.replace(/\u2019/g, "'").replace(/\r\n/g, "\n");
}

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const parsed = await pdfParse(buffer);
  return parsed.text ?? "";
}

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

function extractApplicantFullName(text: string): string | undefined {
  const match = text.match(FULL_NAME_RE);
  if (!match?.[1]) {
    return undefined;
  }
  return match[1].split(/\n/)[0]?.trim();
}

function extractProductLine(text: string): string {
  const fromLabel = text.match(PRODUCT_RE)?.[1]?.trim();
  if (fromLabel) {
    return fromLabel;
  }
  if (/skilled worker/i.test(text)) {
    return "Skilled Worker";
  }
  if (/\bset\s*\(\s*o\s*\)/i.test(text) || /\bilr\b/i.test(text)) {
    return "Set (O) — ILR";
  }
  return "";
}

function extractSubmittedDateIso(text: string): string {
  const raw = text.match(SUBMITTED_RE)?.[1]?.trim() ?? "";
  const isoPrefix = raw.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoPrefix?.[1]) {
    return isoPrefix[1];
  }
  const dmy = raw.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (dmy) {
    const parsed = new Date(`${dmy[2]} ${dmy[1]}, ${dmy[3]}`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  return new Date().toISOString().slice(0, 10);
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
    text = normalizeChecklistText(await extractTextFromPdfBuffer(buffer));
  } catch (error) {
    console.error("[parseChecklistPdf] extract failed:", error);
    const message =
      error instanceof Error && /password/i.test(error.message)
        ? "This PDF appears to be password-protected. Download an unlocked checklist from UKVI."
        : "Could not read this PDF. Try a different export or re-download the checklist from UKVI.";
    throw new ChecklistParseError(message);
  }

  const uanMatch = text.match(UAN_RE);
  const applicantFullName = extractApplicantFullName(text);
  const productLine = extractProductLine(text);

  if (!uanMatch?.[1] || !applicantFullName) {
    throw new ChecklistParseError(
      "Could not find the applicant name and Unique Application Number (UAN) in this checklist. Check you uploaded the full UKVI document checklist PDF.",
    );
  }

  const submittedDate = extractSubmittedDateIso(text);
  const suggestedRoute = classifyChecklistRoute(
    productLine || "UKVI checklist",
    fileName,
    text,
  );
  const uan = uanMatch[1];

  return {
    caseId: caseIdFromUan(uan),
    suggestedRoute,
    uan,
    applicantFullName,
    applicantFirstName: firstNameFromFull(applicantFullName),
    title: inferTitle(applicantFullName),
    submittedDate,
    productLine: productLine || "UKVI checklist",
    parseConfidence: productLine ? "high" : "low",
    checklistExtract: text.slice(0, 80_000),
  };
}
