export type Route = "skilled_worker" | "ilr";

/** Staff-editable cover letter fields (persisted on the case). */
export interface CoverLetterDraft {
  partnerName?: string;
  leaveGrantedFrom?: string;
  leaveGrantedTo?: string;
  litUkReference?: string;
  absenceSummary?: string;
  solicitorNotes?: string;
  lastGeneratedAt?: string;
}

export type CaseStatus =
  | "draft"
  | "live"
  | "client_in_progress"
  | "submitted"
  | "zip_ready";

export type SlotSource = "home_office" | "firm" | "manual";

export type PersonRole = "applicant" | "partner" | null;

export interface SlotTemplate {
  id: string;
  sortNumber: number;
  documentName: string;
  personRole: PersonRole;
  source: SlotSource;
  clientUpload: boolean;
  instructionType: string;
  filenameSuffix?: string;
}

export interface RouteSlotConfig {
  route: Route;
  displayName: string;
  slots: SlotTemplate[];
}

export interface Case {
  id: string;
  status: CaseStatus;
  route: Route;
  uan: string;
  applicantFullName: string;
  applicantFirstName: string;
  title: "Mr" | "Mrs" | "Ms" | "Miss";
  submittedDate: string;
  partnerFirstName?: string;
  partnerFullName?: string;
  dependantPack: boolean;
  staffNotes?: string;
  archiveFolderName?: string;
  clientToken?: string;
  tokenExpiresAt?: string;
  slots: Slot[];
  checklistFileName?: string;
  /** Parsed product / service line from UKVI checklist. */
  productLine?: string;
  /** ISO timestamp for cases list “updated” column. */
  updatedAt?: string;
  /** Checklist PDF parse quality (staff must confirm when low). */
  parseConfidence?: "high" | "low";
  /** Raw text from checklist PDF (staff ILR hints, not shown to clients). */
  checklistExtract?: string;
  /** Staff cover letter editor fields + last generate timestamp. */
  coverLetter?: CoverLetterDraft;
  /** Last time staff reopened the client portal after submission. */
  lastReopen?: {
    note: string;
    reopenedAt: string;
  };
}

export interface SlotRejection {
  message: string;
  rejectedAt: string;
}

export interface Slot {
  id: string;
  sortNumber: number;
  documentName: string;
  personFirstName?: string;
  targetFileName: string;
  source: SlotSource;
  clientUpload: boolean;
  instructionType: string;
  instructions: string;
  donts: string[];
  sampleUrl?: string;
  downloadUrl?: string;
  upload?: { name: string; size: number; uploadedAt: string };
  /** Staff asked the client to replace this upload. */
  rejection?: SlotRejection;
}

export interface Upload {
  slotId: string;
  originalName: string;
  storedPath: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface ClientToken {
  caseId: string;
  token: string;
  expiresAt?: string;
}

/** Persisted demo state (localStorage). */
export interface MockStoreState {
  cases: Case[];
  version: 1;
}
