# Founder pitch — Document Portal (frontend lens)

## Problem

After UKVI submission, caseworkers manually:

1. Read the checklist PDF and decide **Skilled Worker vs ILR** and what else the firm needs (HO lists are often **incomplete** — especially Skilled Worker).
2. Email clients a list → clients reply with **wrong Share Code option**, **cropped passports**, random filenames.
3. Staff rename and sort into **numbered folders** before OneDrive / submission prep.

**Cost:** time per case, rework, client frustration, risk of missing a mandatory item.

## Solution

A **two-sided web app**:

| Side | Experience |
|------|------------|
| **Staff** | Upload checklist → confirm UAN & route → publish **one link** |
| **Client** | See **exact slots** with **your curated instructions** + examples → upload → **Finish** |
| **Output** | Staff download **zip** already named like today’s `Documents/` + `Misc/` trees |

**Routes in v1:** Skilled Worker + ILR only. Everything else is template expansion later.

## Why frontend-first pitch works

Phase 1 is a **fully navigable demo** (mock backend) that shows:

- The **aha moment**: checklist in → structured pack out.
- **Client instructions** (Share Code = “prove an immigration matter”) visible **at upload**, not buried in email.
- **Route difference** side by side: Dino (10 slots, two people) vs Sophy (9 slots, absence + payslip).

Founder can **feel** the product before infra spend.

## Differentiation

| Today | With portal |
|-------|-------------|
| Generic email checklist | **Numbered slots** = your OneDrive naming |
| HO PDF only | HO + **firm mandatory** docs (e-visa, share code, consent) |
| “Send your passport” | **Do / don’t + sample** per document |
| WhatsApp photo dumps | **7 MB per file**, progress **saved for later** |

## MVP boundaries (honest)

From plan.md — **out of scope:** supervisor role, UK GDPR/compliance program, audit logs, OneDrive/SharePoint API, routes beyond Skilled Worker + ILR.

- No OneDrive API yet — **zip download**.
- No supervisor dashboard.
- No full ILR cover-letter narrative editor in Phase 1 — **preview in Phase 3**.
- Parsing assists staff; **human confirms** before client link goes out.
- Staff checklist upload **PDF only** (~15 MB); client files **7 MB each**.
- **No email** required in MVP — manual follow-up or dashboard status.

## Ask

1. **Approve Phase 1 demo** (1–2 weeks): pitch-ready UI + Dino/Sophy flows.
2. **Approve Phase 2** build: real uploads + zip for internal pilot on live cases.
3. **Name the product** + firm branding (logo, colours) before Phase 3 polish.

## ROI story (qualitative)

- Fewer “what is this file?” messages.
- Clients self-serve with **your** wording baked in.
- New hires follow the same slot tree as seniors (instructions in UI).

See [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md) for live demo beats.
