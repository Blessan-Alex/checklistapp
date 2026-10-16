# MVP Frontend Plan — Document Portal

Phased **frontend** roadmap to **pitch** and **build** the UK immigration document upload product. Grounded in [`../plan.md`](../plan.md) and [`../route-comparison.md`](../route-comparison.md).

**Full plan.md coverage:** see [`PLAN-COVERAGE.md`](PLAN-COVERAGE.md) (section-by-section index). Product behaviour duplicated for builders in [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md), slots/zip in [`SLOT-TEMPLATES.md`](SLOT-TEMPLATES.md), instruction copy in [`CLIENT-INSTRUCTIONS.md`](CLIENT-INSTRUCTIONS.md).

**Build the Next.js app:** chained Agent prompts in [`PROMPTS.md`](PROMPTS.md) (Phase 1 = founder-complete demo with samples).

## Who this is for

| Audience | Use this doc |
|----------|----------------|
| **Founder** | [`FOUNDER-PITCH.md`](FOUNDER-PITCH.md) + [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md) |
| **Design / FE dev** | [`NORTH-STAR-UI.md`](NORTH-STAR-UI.md) + [`SCREEN-INVENTORY.md`](SCREEN-INVENTORY.md) |
| **Delivery** | [`phases/`](phases/) — Phase 1 → 4 |

## Product in one sentence

Staff upload a Home Office checklist PDF → the app builds a **numbered document pack** (Skilled Worker or ILR) with **firm instructions** → client uploads via a **link** → staff download a **zip** named like your OneDrive folders today.

## Frontend stack (recommended)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js** (App Router) | Staff + client routes, API routes colocated, easy deploy |
| UI | **React** + **Tailwind** + **shadcn/ui** | Fast, professional pitch demo; accessible components |
| State | React Query / SWR for server state; URL for client token | Clear loading/error for uploads |
| Phase 1 data | **Mock JSON** + optional `localStorage` | Demo without backend |
| Phase 2+ | Same app wired to SQLite API | No rewrite |

## Phase overview

| Phase | Goal | Founder sees |
|-------|------|----------------|
| [**1 — Pitch demo**](phases/PHASE-1-pitch-demo.md) | Clickable, believable UI end-to-end | “This is the product” |
| [**2 — Functional MVP**](phases/PHASE-2-functional-mvp.md) | Real uploads, save, zip trigger | “Clients can use it today” |
| [**3 — Complete UI**](phases/PHASE-3-complete-ui.md) | Instructions, samples, cover letter, staff tools | “Matches how we work” |
| [**4 — Final product UI**](phases/PHASE-4-final-product.md) | North-star polish + future routes/integrations | “Scale and brand” |

## Two personas, two shells

```text
/staff/*     → Caseworker (login required)
/c/*         → Client (token in URL, no login)
```

Route-specific slot trees differ (see `route-comparison.md`); the **same client components** render ILR vs Skilled Worker from config.

## Demo cases (use in all phases)

| Case | Route | Seed data |
|------|-------|-----------|
| Dino Dominic | Skilled Worker (dependant) | `Resources/Skilled worker dino dominic/` |
| Sophy Bijumon | ILR SET(O) | `Resources/ILR sophy/` |

## Out of scope (MVP — from plan.md)

Supervisor role, formal UK GDPR/compliance program, audit logs, OneDrive/SharePoint API, visa routes other than Skilled Worker + ILR.

## Folder contents

```text
mvp-frontend-plan/
  README.md
  PLAN-COVERAGE.md            ← plan.md §1–15 → where documented
  PHASE-MAPPING.md            ← plan.md build phases ↔ FE phases
  PRODUCT-SPEC.md             ← parsing, engine, arch, validation, §13–14
  SLOT-TEMPLATES.md           ← §7 naming, SW/ILR trees, Misc, zip
  CLIENT-INSTRUCTIONS.md      ← §6 full client + staff guidance copy
  FOUNDER-PITCH.md
  NORTH-STAR-UI.md
  INFORMATION-ARCHITECTURE.md
  SCREEN-INVENTORY.md
  DEMO-SCRIPT.md
  PROMPTS.md                  ← chained Next.js build prompts + VERIFY gates
  phases/
    PHASE-1-pitch-demo.md
    PHASE-2-functional-mvp.md
    PHASE-3-complete-ui.md
    PHASE-4-final-product.md
```

## Success metrics (frontend)

- Client completes upload on **phone** without calling the office.
- Staff creates a case and copies link in **under 3 minutes** after checklist upload.
- **Zero** mystery attachments — every file tied to a numbered slot.
- Zip preview shows filenames matching `{n} {document name} {firstName}`.
