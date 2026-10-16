/**
 * Maps instruction types to public sample assets (Prompt 1.2).
 * Paths are site-root relative for use in `<img src={sampleUrl}>`.
 */
const SAMPLES_BASE = "/samples";

export const SAMPLE_URL_BY_INSTRUCTION_TYPE: Record<string, string> = {
  passport: `${SAMPLES_BASE}/passport-four-edges.svg`,
  sharecode: `${SAMPLES_BASE}/sharecode-immigration-matter.svg`,
  evisa: `${SAMPLES_BASE}/evisa-dates-visible.svg`,
  brp: `${SAMPLES_BASE}/brp-example.svg`,
  "ho-consent": `${SAMPLES_BASE}/ho-consent-signed-example.svg`,
  marriage: `${SAMPLES_BASE}/marriage-cert.svg`,
  cos: `${SAMPLES_BASE}/cos-reference.svg`,
  "absence-letter": `${SAMPLES_BASE}/employer-letter.svg`,
  "travel-ticket": `${SAMPLES_BASE}/travel-ticket.svg`,
  payslip: `${SAMPLES_BASE}/payslip.svg`,
  bank: `${SAMPLES_BASE}/bank-statement.svg`,
  "employer-letter": `${SAMPLES_BASE}/employer-letter.svg`,
};

export function getSampleUrlForInstructionType(
  instructionType: string,
  clientUpload: boolean,
): string | undefined {
  if (!clientUpload || instructionType === "cover-letter") {
    return undefined;
  }
  return SAMPLE_URL_BY_INSTRUCTION_TYPE[instructionType];
}
