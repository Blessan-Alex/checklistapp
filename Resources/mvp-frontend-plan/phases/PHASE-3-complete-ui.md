# Phase 3 — Complete UI (matches firm workflow)

**Duration:** ~3 weeks  
**Goal:** Every default slot has **samples** and **downloads**; staff get **cover letter** + **internal guidance**; Skilled Worker **dependant** UX solid.

**Implements plan.md §12 Phase 2 (polish)** + §6.5 samples, §8 cover letter UI — see [`../PHASE-MAPPING.md`](../PHASE-MAPPING.md).

## Outcome

Frontend matches [`../NORTH-STAR-UI.md`](../NORTH-STAR-UI.md) for Skilled Worker + ILR — minus Phase 4 integrations.

## Frontend work

### Instructions & education

- [ ] Load per-slot `instructions` + `donts` from config by slot **type** (passport, sharecode, …).
- [ ] `SampleThumb` + lightbox for every default slot (assets in `public/samples/`).
- [ ] HO consent slot: **Download blank PDF** button.
- [ ] General instructions synced with plan §6.2 (markdown render).

### Staff review enhancements

- [ ] **Add slot** modal: number, document name, first name, instructions textarea.
- [ ] **Dependant pack** toggle (SW): show/hide partner rows with animation; renumber warning if staff edited numbers.
- [ ] **ILR checklist hints:** if parse finds “previous passports”, suggest new row with one click.
- [ ] **Internal guidance** drawer (plan §6.4) — collapsible, staff-only.

### Cover letter (UI)

- [ ] Staff **Cover letter** tab on case detail:
  - Route-specific form fields (SW: partner name; ILR: grant dates, LitUK ref, absence summary).
  - **Preview** generated DOCX/PDF in iframe or download preview.
  - Regenerate button after edits.
- [ ] Client UI still does **not** upload cover letter slot (show “Prepared by your adviser”).

### Client quality nudges

- [ ] Soft warnings on e-Visa / Share Code slots (banner, not blocking).
- [ ] Passport slot: extra callout for four corners (icon checklist).

### Staff dashboard polish

- [ ] Filters + sort on cases list.
- [ ] Empty states with CTA “Create first case”.
- [ ] Case detail timeline component.

### Zip UX

- [ ] Pre-download **manifest modal**: list `Documents/` filenames staff will get.
- [ ] Success toast with file size.

## Content deliverables (non-code)

- [ ] Redacted sample images per slot type (designer / caseworker).
- [ ] `home-office-consent-blank.pdf` in `public/templates/`.
- [ ] Proofread all instruction strings with senior caseworker.

## Acceptance criteria

- [ ] New hire can upload HO consent using only in-app instructions.
- [ ] Founder cannot tell demo from production on client mobile view.
- [ ] ILR Sophy pack and SW Dino pack both fully documented in UI.

## Not in Phase 3

- OneDrive
- Extra visa routes
- Staff “reject upload” workflow
- Email to client
