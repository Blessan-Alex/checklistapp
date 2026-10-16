# Information architecture

## URL map (final)

| URL | Persona | Auth |
|-----|---------|------|
| `/` | Redirect | — |
| `/staff/login` | Staff | — |
| `/staff/cases` | Staff | Session |
| `/staff/cases/new` | Staff | Session |
| `/staff/cases/[id]/review` | Staff | Session |
| `/staff/cases/[id]` | Staff | Session |
| `/c/[token]` | Client | Token |
| `/c/[token]/slot/[slotId]` | Client | Token |
| `/c/[token]/finish` | Client | Token |
| `/c/[token]/done` | Client | Token |

## Data shown per view

### Staff case object (frontend model)

```ts
type Route = "skilled_worker" | "ilr";

type CaseStatus =
  | "draft"
  | "live"
  | "client_in_progress"
  | "submitted"
  | "zip_ready";

interface Case {
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
}

interface Upload {
  slotId: string;
  originalName: string;
  storedPath: string;
  sizeBytes: number;
  uploadedAt: string;
}

interface ClientToken {
  caseId: string;
  token: string;
  expiresAt?: string;
}

interface Slot {
  id: string;
  sortNumber: number;
  documentName: string;
  personFirstName?: string;
  targetFileName: string; // computed
  source: "home_office" | "firm" | "manual";
  clientUpload: boolean; // false for cover letter
  instructions: string;
  donts: string[];
  sampleUrl?: string;
  downloadUrl?: string;
  upload?: { name: string; size: number; uploadedAt: string };
}
```

### Route → default slot count

| Route | Typical slots (client upload) | Generated |
|-------|------------------------------|-----------|
| Skilled Worker (dependant) | 9 uploads (excl. cover) | Cover #3 |
| Skilled Worker (main only) | fewer (no partner rows) | Cover #3 |
| ILR | 8 uploads | Cover #9 |

Exact lists: [`SLOT-TEMPLATES.md`](SLOT-TEMPLATES.md) + [`../route-comparison.md`](../route-comparison.md) §3.

## Config files (drive UI without hardcoding)

```text
frontend/
  config/
    routes/
      skilled-worker.slots.json
      ilr.slots.json
    checklist-keywords.json
    instructions/
      general.md
      by-slot-type/
        sharecode.md
        evisa.md
        passport.md
        ho-consent.md
    mock/
      case-dino.json
      case-sophy.json
```

## Navigation flows

**Staff happy path**

`login` → `cases` → `new` (upload PDF) → `review` → publish → `cases/[id]` (watch progress) → download zip.

**Client happy path**

`/c/token` → slot list → slot detail (×N) → `finish` → `done`.

**Pitch demo path (Phase 1)**

Skip login OR fake login → load `case-dino.json` → jump to client via “Preview as client”.
