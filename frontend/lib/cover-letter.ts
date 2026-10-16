import type { Case, CoverLetterDraft, Route } from "@/lib/types";

export type { CoverLetterDraft };

export function defaultCoverLetterDraft(caseRecord: Case): CoverLetterDraft {
  const existing = caseRecord.coverLetter ?? {};
  return {
    partnerName:
      existing.partnerName ??
      caseRecord.partnerFullName ??
      caseRecord.partnerFirstName ??
      "",
    leaveGrantedFrom: existing.leaveGrantedFrom ?? "",
    leaveGrantedTo: existing.leaveGrantedTo ?? "",
    litUkReference: existing.litUkReference ?? "",
    absenceSummary: existing.absenceSummary ?? "",
    solicitorNotes: existing.solicitorNotes ?? "",
    lastGeneratedAt: existing.lastGeneratedAt,
  };
}

export function buildCoverLetterPlainText(
  caseRecord: Case,
  draft: CoverLetterDraft,
): string {
  const submitted = caseRecord.submittedDate || "—";
  const uan = caseRecord.uan;
  const applicant = `${caseRecord.title} ${caseRecord.applicantFullName}`;

  if (caseRecord.route === "skilled_worker") {
    const partner =
      draft.partnerName?.trim() ||
      caseRecord.partnerFullName ||
      caseRecord.partnerFirstName ||
      "—";
    const notes = draft.solicitorNotes?.trim();

    return [
      "COVERING LETTER — SKILLED WORKER",
      "",
      `Unique Application Number: ${uan}`,
      `Applicant: ${applicant}`,
      `Application submitted: ${submitted}`,
      `Dependant / partner named in this application: ${partner}`,
      "",
      "Dear Sir or Madam,",
      "",
      `We act for ${caseRecord.applicantFirstName} ${caseRecord.applicantFullName.split(/\s+/).slice(-1)[0] ?? ""} in respect of the above application (UAN ${uan}).`,
      "",
      "Please find enclosed the supporting documents listed in the document index. All documents have been checked against the Home Office checklist and our office standards.",
      "",
      notes ? `Additional notes:\n${notes}\n` : "",
      "Yours faithfully,",
      "",
      "L-Cedar Immigration",
    ]
      .filter(Boolean)
      .join("\n");
  }

  const notes = draft.solicitorNotes?.trim();
  return [
    "COVERING LETTER — INDEFINITE LEAVE TO REMAIN",
    "",
    `Unique Application Number: ${uan}`,
    `Applicant: ${applicant}`,
    `Application submitted: ${submitted}`,
    "",
    "Leave granted (current permission):",
    `  From: ${draft.leaveGrantedFrom?.trim() || "—"}`,
    `  To: ${draft.leaveGrantedTo?.trim() || "—"}`,
    "",
    `Life in the UK / English language reference: ${draft.litUkReference?.trim() || "—"}`,
    "",
    "Absences from the UK (summary):",
    draft.absenceSummary?.trim() || "—",
    "",
    "Dear Sir or Madam,",
    "",
    `We act for ${applicant} in respect of the above ILR application (UAN ${uan}).`,
    "",
    "Please find enclosed the supporting documents listed in the document index, including absence and financial evidence where applicable.",
    "",
    notes ? `Additional notes:\n${notes}\n` : "",
    "Yours faithfully,",
    "",
    "L-Cedar Immigration",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCoverLetterHtml(
  caseRecord: Case,
  draft: CoverLetterDraft,
): string {
  const text = buildCoverLetterPlainText(caseRecord, draft);
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Cover letter preview</title><style>
    body { font-family: Georgia, "Times New Roman", serif; max-width: 40rem; margin: 2rem auto; line-height: 1.5; color: #1a1a2e; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 0.95rem; }
  </style></head><body><pre>${escaped}</pre></body></html>`;
}

export function coverLetterDownloadName(caseRecord: Case): string {
  const slot = caseRecord.slots.find((s) => s.instructionType === "cover-letter");
  const base = slot?.targetFileName ?? "Cover Letter";
  return `${base}.txt`;
}

export function routeCoverLetterLabel(route: Route): string {
  return route === "ilr" ? "ILR covering letter" : "Skilled Worker covering letter";
}
