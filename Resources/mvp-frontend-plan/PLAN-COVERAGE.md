# plan.md coverage map

This folder is the **frontend + pitch** delivery view of [`../plan.md`](../plan.md). Every section of `plan.md` is captured below. Primary home for each topic is listed; **full detail** lives in the linked file (not duplicated in pitch docs).

| plan.md § | Topic | Primary document | Status |
|-----------|--------|------------------|--------|
| Intro | Product one-liner, scope (SW + ILR), out of scope | [`README.md`](README.md), [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §Scope | Covered |
| §1 | Problem, MVP success, constraints (7 MB, mandatory, save later, zip, no audit) | [`FOUNDER-PITCH.md`](FOUNDER-PITCH.md), [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §1 | Covered |
| §2 | Users (staff + client, no supervisor) | [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §2, [`INFORMATION-ARCHITECTURE.md`](INFORMATION-ARCHITECTURE.md) | Covered |
| §3 | End-to-end flow, staff steps, client steps | [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §3, [`NORTH-STAR-UI.md`](NORTH-STAR-UI.md) | Covered |
| §4 | PDF parsing, regex, route rules, keyword map, staff confirm | [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §4 | Covered |
| §5 | Requirements engine (3 layers), office standards | [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §5, [`SLOT-TEMPLATES.md`](SLOT-TEMPLATES.md) | Covered |
| §6 | Client instructions, samples, staff guidance | [`CLIENT-INSTRUCTIONS.md`](CLIENT-INSTRUCTIONS.md) | Covered |
| §7 | Naming, SW/ILR trees, Misc, zip layout, Finish behaviour | [`SLOT-TEMPLATES.md`](SLOT-TEMPLATES.md), [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §7 | Covered |
| §8 | Cover letter templates, placeholders, MVP A/B | [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §8 | Covered |
| §9 | UI pages (staff + client) | [`SCREEN-INVENTORY.md`](SCREEN-INVENTORY.md), [`NORTH-STAR-UI.md`](NORTH-STAR-UI.md) | Covered |
| §10 | Tech arch, data model | [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §10 | Covered |
| §11 | Validation rules | [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §11 | Covered |
| §12 | Phased build (product) | [`phases/`](phases/) + [`PHASE-MAPPING.md`](PHASE-MAPPING.md) | Covered |
| §13 | Open choices / defaults | [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §13 | Covered |
| §14 | Developer resource checklist | [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §14 | Covered |
| §15 | Summary | [`README.md`](README.md) | Covered |

**Also aligned with:** [`../route-comparison.md`](../route-comparison.md) — route differences reflected in [`SLOT-TEMPLATES.md`](SLOT-TEMPLATES.md) and demo cases (Dino / Sophy).

## Frontend phases vs plan.md §12

| plan.md build phase | Frontend plan phase | Notes |
|---------------------|---------------------|--------|
| §12 Phase 1 — core loop | [`PHASE-1`](phases/PHASE-1-pitch-demo.md) (UI mock) + [`PHASE-2`](phases/PHASE-2-functional-mvp.md) (real loop) | Pitch demo front-loads UI; plan’s “core loop” = Phase 2 FE |
| §12 Phase 2 — polish | [`PHASE-3`](phases/PHASE-3-complete-ui.md) | Samples, cover letter UI, guidance, dependant toggle, parse hints |
| §12 Phase 3 — later | [`PHASE-4`](phases/PHASE-4-final-product.md) | OneDrive, more routes, email, supervisor |

See [`PHASE-MAPPING.md`](PHASE-MAPPING.md) for item-by-item checklist.
