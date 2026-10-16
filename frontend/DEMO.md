# Founder demo walkthrough (Phase 1)

Local dev server: **`npm run dev`** → [http://localhost:3000](http://localhost:3000)

Mirrors [`../mvp-frontend-plan/DEMO-SCRIPT.md`](../mvp-frontend-plan/DEMO-SCRIPT.md). Target time: **under 6 minutes** (Dino, then Sophy).

| Case | Staff review | Client portal |
|------|----------------|---------------|
| **Dino Dominic** (Skilled Worker) | [http://localhost:3000/staff/cases/case-dino/review](http://localhost:3000/staff/cases/case-dino/review) | [http://localhost:3000/c/demo-dino](http://localhost:3000/c/demo-dino) |
| **Sophy Bijumon** (ILR) | [http://localhost:3000/staff/cases/case-sophy/review](http://localhost:3000/staff/cases/case-sophy/review) | [http://localhost:3000/c/demo-sophy](http://localhost:3000/c/demo-sophy) |

Staff login: any email/password (demo auth). Use the toolbar **Switch case focus** → lands on **review**; **Client link** opens the portal for the focused case.

Legacy client URL for Sophy: [http://localhost:3000/c/demo-sophy-ilr](http://localhost:3000/c/demo-sophy-ilr)

---

## Setup (~30 sec)

“This is the document portal we want for every Skilled Worker and ILR case after UKVI submission.”

1. Open [http://localhost:3000/staff/login](http://localhost:3000/staff/login) → sign in.
2. Open [http://localhost:3000/staff/cases](http://localhost:3000/staff/cases) → **Dino Dominic** (or use switcher).

---

## Beat 1 — Checklist in (~45 sec)

1. [New case](http://localhost:3000/staff/cases/new) (optional) or open Dino **review** above.
2. Point at **UAN** `1212-0001-6479-0157` and **Skilled Worker** route.
3. Note **11 client uploads** (numbered pack through slot 10; cover letter slot 3 is adviser-generated).

---

## Beat 2 — Staff review (~60 sec)

1. Scroll **slot table** — pack labels e.g. `1 Passport Dino`, `7 Sharecode Dino`.
2. Toggle **dependant pack** to show/hide partner slots.
3. **Publish** → copy client link `http://localhost:3000/c/demo-dino`.

---

## Beat 3 — Client on phone (~90 sec)

1. Open [http://localhost:3000/c/demo-dino](http://localhost:3000/c/demo-dino) at ~375px width.
2. **Before you start** — share code: **“To prove an immigration matter.”**
3. Open **Sharecode** slot — do/don’t + sample image.
4. Upload a file → **Saved ✓**; progress updates (e.g. `1/11`).

---

## Beat 4 — Finish & staff payoff (~45 sec)

1. On [case detail](http://localhost:3000/staff/cases/case-dino): **Simulate client completed** (or finish on client).
2. **Download zip** → manifest shows `Documents/` numbered filenames + generated cover letter + `Misc/` checklist.
3. Status **Submitted** / **Zip ready**.

---

## Beat 5 — ILR contrast (~60 sec)

1. Toolbar → **Sophy Bijumon (ILR)** → [review](http://localhost:3000/staff/cases/case-sophy/review).
2. Client: [http://localhost:3000/c/demo-sophy](http://localhost:3000/c/demo-sophy).
3. Call out **absence letter + travel ticket** (slot 2), **payslip + bank** (slot 5), **share code** (slot 3), **cover letter last** (slot 9, adviser-generated).
4. **11 client uploads** across **8 numbered tiers** (1–8) — same UX, different config.

---

## Close (~30 sec)

“Phase 2 wires real uploads and zip. Phase 3 adds every sample image and cover letter preview. No OneDrive API until we’ve piloted.”

---

## Deploy (optional)

**Vercel:** import `frontend` as the project root. No environment variables required for the Phase 1 mock demo (`localStorage` only). Build command: `npm run build`; output: Next.js default.

---

## Regenerate mock JSON from instructions

```bash
cd frontend
node scripts/generate-mock-cases.mjs
```
