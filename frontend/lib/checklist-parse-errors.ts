/** Checklist PDF could not be read (missing UAN, name, etc.). */
export class ChecklistParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChecklistParseError";
  }
}

/** Route/product not Skilled Worker or ILR (e.g. FM, naturalisation). */
export class UnsupportedChecklistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedChecklistError";
  }
}

export const UNSUPPORTED_CHECKLIST_MESSAGE =
  "This checklist type is not supported yet. We only support Skilled Worker and ILR checklists right now — more routes coming soon.";
