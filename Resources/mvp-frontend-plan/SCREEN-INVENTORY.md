# Screen inventory & component map

## Pages × phases

| Screen | P1 Demo | P2 MVP | P3 Complete | P4 Final |
|--------|---------|--------|-------------|----------|
| Staff login | Fake | Real | Real | SSO option |
| Cases list | Static | Live API | + filters | + search |
| New case upload | Mock parse | Real PDF | + parse errors UI | + drag preview |
| Case review | Full UI | Full + API | + add slot | + bulk edit |
| Case detail | Status mock | Live progress | + cover preview | + reopen client |
| Client hub | Full | Full + API | + samples all | + i18n |
| Client slot | Instructions | Upload real | + warnings | + offline hint |
| Client finish | UI only | Lock case | — | — |
| Thank you | ✓ | ✓ | ✓ | ✓ |

## Shared components (build once, reuse)

| Component | Used on |
|-----------|---------|
| `AppShellStaff` | All staff pages |
| `AppShellClient` | All `/c/*` |
| `RouteBadge` | Cases list, review |
| `UanField` | Review, case detail header |
| `SlotTable` | Review (editable), case detail (read-only) |
| `SlotCard` | Client hub list |
| `InstructionPanel` | General + per-slot |
| `DontList` | Slot detail |
| `SampleThumb` | Slot detail |
| `UploadDropzone` | Slot detail, new case |
| `ProgressRing` | Client shell |
| `CopyLinkButton` | Review, case detail |
| `PublishDialog` | Review |
| `ZipDownloadCard` | Case detail |
| `CoverLetterPreview` | Review/detail — P3+ |
| `InternalGuidanceDrawer` | Review — P3 |

## Client slot status UI

```text
○ Not started   — grey
◐ Uploading     — spinner
✓ Uploaded      — green + filename
⚠ Needs fix     — future staff reject
```

## Staff case status chips

| Status | Colour | Meaning |
|--------|--------|---------|
| Draft | grey | Not published |
| Live | blue | Link out, client not done |
| Client in progress | amber | Some uploads |
| Submitted | green | Client finished |
| Zip ready | purple | Download available |

## Responsive breakpoints

| Breakpoint | Client | Staff |
|------------|--------|-------|
| `< md` | Single column, sticky Finish | Cards not table |
| `≥ md` | List + detail split optional | Slot table full |
| `≥ lg` | Max width 640px centred (client) | Two-column review |

## Validation UX (from plan.md §11)

| Rule | UI behaviour |
|------|----------------|
| Staff checklist PDF | PDF only; reject non-PDF; max ~15 MB |
| Client files | ≤ 7 MB; types pdf/jpg/jpeg/png (+ doc if CoS pending) |
| e-Visa / Share Code | Soft warning banner (non-blocking MVP) |
| Finish | Disabled until all client-upload slots filled |
| After submit | Client UI locked; staff zip + optional reopen (v2/P4) |
| Filename preview | Show sanitized `targetFileName` before zip |

## Pitch demo shortcuts (Phase 1 only)

- Header chip: **“Demo mode”**.
- Switch case: dropdown Dino / Sophy.
- Button: **Simulate client completed** → staff zip ready state.
