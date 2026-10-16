import type { Case } from "@/lib/types";
import { getFirmBranding } from "@/lib/firm-branding";

export function buildClientInstructionsPrintHtml(
  caseRecord: Case,
  generalInstructions: string,
): string {
  const brand = getFirmBranding();
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const slotSections = caseRecord.slots
    .filter((s) => s.clientUpload)
    .map(
      (slot) => `
      <section class="slot">
        <h3>${escape(slot.targetFileName)}</h3>
        <p class="muted">${escape(slot.documentName)}</p>
        <pre>${escape(slot.instructions)}</pre>
      </section>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escape(brand.name)} — document instructions</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; color: #21173f; line-height: 1.5; }
    h1 { font-size: 1.25rem; color: #621d92; }
    h2 { font-size: 1rem; margin-top: 1.5rem; }
    h3 { font-size: 0.95rem; margin: 1rem 0 0.25rem; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 0.9rem; }
    .muted { color: #555; font-size: 0.85rem; }
    .slot { page-break-inside: avoid; margin-bottom: 1rem; }
    @media print { body { margin: 1cm; } }
  </style>
</head>
<body>
  <h1>${escape(brand.name)}</h1>
  <p>Applicant: <strong>${escape(caseRecord.applicantFullName)}</strong><br/>
  UAN: <strong>${escape(caseRecord.uan)}</strong></p>
  <h2>Before you start</h2>
  <pre>${escape(generalInstructions)}</pre>
  <h2>Your documents</h2>
  ${slotSections}
  <p class="muted">Generated ${new Date().toLocaleString("en-GB")}</p>
</body>
</html>`;
}
