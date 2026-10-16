import { INSTRUCTIONS_FROM_MARKDOWN } from "@/lib/instructions-bundled";

export interface SlotInstructionContent {
  instructions: string;
  donts: string[];
}

const DONTS_BY_TYPE: Record<string, string[]> = {
  passport: [
    "Cropped edges or missing corners",
    "Glare hiding the MRZ or photo",
    "Blurry or low-resolution images",
  ],
  sharecode: [
    'Selecting "right to rent" or "right to work" instead of immigration matter',
    "Expired or partially visible share code",
    "Screenshot missing the code expiry date",
  ],
  evisa: [
    "Missing start or end date on the screenshot",
    "Cropped screenshot of only part of the status page",
  ],
  "ho-consent": [
    "Unsigned form or missing signature date",
    "Incomplete address or postcode fields",
  ],
  brp: ["Glare on the card number", "Cropped card edges"],
  cos: ["Uploading an outdated CoS reference without adviser confirmation"],
  marriage: ["Cropped certificate edges", "Unreadable registrar stamps"],
  "absence-letter": [
    "Dates that do not match travel tickets",
    "Unsigned letter",
  ],
  "travel-ticket": ["Ticket dates inconsistent with employer letter"],
  payslip: ["Payslip older than one calendar month before application"],
  bank: ["Statement that does not show the payslip deposit"],
  "employer-letter": ["Unsigned letter or missing company details"],
  "cover-letter": [],
};

export function instructionForType(type: string): SlotInstructionContent {
  const instructions =
    INSTRUCTIONS_FROM_MARKDOWN[type] ??
    "Follow your adviser's guidance for this document.";
  const donts = DONTS_BY_TYPE[type] ?? [];
  return { instructions, donts };
}
