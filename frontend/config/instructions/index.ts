export const INSTRUCTION_PATHS = {
  general: "config/instructions/general.md",
  bySlotType: "config/instructions/by-slot-type",
} as const;

export const SLOT_INSTRUCTION_TYPES = [
  "passport",
  "sharecode",
  "evisa",
  "ho-consent",
  "brp",
  "cos",
  "marriage",
  "absence-letter",
  "travel-ticket",
  "payslip",
  "bank",
  "employer-letter",
  "cover-letter",
] as const;
