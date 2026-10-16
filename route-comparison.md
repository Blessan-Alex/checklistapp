# Skilled Worker vs ILR — What Differs (Core Notes)

Based on `Resources/Skilled worker dino dominic/` and `Resources/ILR sophy/`.

---

## 1. Checklist PDF — ignore vs use

### Same on every UKVI checklist (do not drive upload slots from this)

- Header: “Document Checklist”, payment lines, email, **Submitted date**
- **Unique Application Number (UAN)**
- **Applicant’s full name**, DOB, nationality
- Legal representative block (your firm — static)
- Long boilerplate: self-upload, biometrics, “Further actions”, processing times

**Parser should only rely on the applicant block + evidence bullets, not the repeated legal text.**

### What actually differs

| | **Skilled Worker (Dino sample)** | **ILR (Sophy sample)** |
|---|----------------------------------|-------------------------|
| **Pages** | 2 | 3 |
| **Product / service** | `PBS … dependant partner` (route label varies) | `Set (O)` |
| **Extra header** | — | `Sponsor type: Normal` |
| **HO “Mandatory documents”** | **Only applicant passport** | Applicant passport |
| **HO “Other documents”** | **None listed** | **Long list** (see below) |
| **Biometrics note** | Standard service / 8 weeks | Priority / 5 working days (case-specific) |

**Main insight:** For **Skilled Worker**, the HO checklist is **almost empty** — your **office template** (partner, marriage, CoS, both people’s e-visa/BRP, etc.) is what matters. For **ILR**, the HO list is **rich** and should **align with** (and sometimes extend) your folder template.

### ILR checklist bullets → your slots (mapping)

| Checklist wording | Your outcome slot |
|-------------------|-------------------|
| Passport (mandatory) | `1 … Passport` |
| Reasons for absences from the UK | `2` employer letter + `2` travel ticket |
| Immigration status in the UK | `3` E-Visa + `3` Sharecode |
| Consent for verification checks | `4` Home office consent form |
| Payslip + bank statement | `5` Payslip + `5` Bank statement |
| Sponsor letter (Tier 2 / CoS history) | `6` Letter from employer |
| (CoS reference in employment history) | `7` CoS |
| (Status evidence) | `8` BRP |
| — | `9` Cover letter (**firm**, not on HO list) |

**Often on ILR checklist but not in Sophy folder sample:** “All previous passports…” → add slot when that line appears.

### Essential fields to extract (both routes)

1. **UAN** — always; also goes in cover letter  
2. **Product name/service** — **pick route**: `Set (O)` → ILR; skilled worker / PBS / dependant → Skilled Worker template  
3. **Applicant full name** — parse title (Mr/Mrs/Ms) + **first name** for filenames  
4. **Submitted date** — cover letter date line  
5. **(ILR only)** Scan **Other documents** for: absence, consent, payslip/bank, sponsor letter, previous passports — flag extras for staff  

**Skilled Worker only (not on HO PDF):** staff enters **partner/sponsor name** (cover letter: “partner of Mrs …”) and whether **dependant pack** applies (second passport, marriage cert, two BRPs, etc.).

---

## 2. Covering letter — same shell, different job

### Shared structure

- To: Case Officer, UKVI / Home Office  
- **Date**, **UAN**, **Re:** line, **Dear Sir/Madam**  
- Adviser sign-off (Ephraim Abraham — static in template)

### Skilled Worker template (short)

- **Re:** `Skilled worker dependant visa application` + client name  
- **One paragraph:** client applying as **partner of [sponsor]** on Skilled Worker route  
- **Variables:** UAN, date, **Mr/Mrs + full name**, **sponsor/partner full name**  
- No employment history, no absences, no Life in the UK  

### ILR template (long)

- **Re:** `ILR Application SET(O)` + client name  
- **Narrative blocks:** first grant as Skilled Worker (date), **5-year qualifying period** end date, **application submitted** date  
- **Life in the UK Test** reference (case-specific — staff must fill)  
- **Absence paragraph** (country, days, within limits, annual leave) + points to **ticket + employer letter** (matches slots `2`)  
- **Variables:** UAN, date, name/title, plus **many dates and facts not in the checklist PDF** (MVP: staff edits body fields; auto-fill UAN/name/date only)

| | SW | ILR |
|---|----|-----|
| Length | ~1 screen | ~2 screens |
| Auto from checklist alone | UAN, name, route hint | UAN, name, submitted date, absence *if* you parse bullets |
| Staff must type | Partner/sponsor name | Grant dates, LitUK ref, absence details, employer narrative |

---

## 3. Final document outcome — what’s different

**Shared naming rule:** `{number} {document name} {first name when person-specific}`  

**Shared document types (both routes):** passport, Home Office consent, E-Visa + Sharecode (pair, same number), BRP, CoS, cover letter.

### Skilled Worker (Dino) — dependant case

| Theme | Detail |
|--------|--------|
| **People** | **Two** first names (applicant + partner) on many files |
| **Relationship** | `6 Marriage Certificate` |
| **CoS** | Applicant: `5 CoS … pending` (can be placeholder) |
| **Cover letter position** | `3 Cover Letter` (early) |
| **BRP** | **Both** people (`9` / `10`) |
| **HO vs folder** | HO asked only for **one passport**; folder has **10+** items |
| **Misc** | Checklist PDF, VAF PDF, Google Form, extra `11 Cover Letter` |

### ILR (Sophy) — single applicant

| Theme | Detail |
|--------|--------|
| **People** | **One** first name on passport / e-visa / sharecode / BRP |
| **Absences** | Two slot-`2` docs (employer letter + travel ticket) — **ILR-specific** |
| **Employment / funds** | `5` payslip + bank, `6` employer letter — **not in SW sample** |
| **CoS** | `7 CoS` (historical sponsor route), not “pending partner” style |
| **Cover letter position** | `9 Cover Letter` (**last** in main list) |
| **BRP** | One person (`8`) |
| **No** | Marriage cert, second passport, partner e-visa/sharecode |

### Side-by-side counts (sample templates)

| Item | Skilled Worker (Dino) | ILR (Sophy) |
|------|------------------------|-------------|
| Main numbered files | 10 (+ generated cover at 3) | 9 (+ generated cover at 9) |
| Second person docs | Yes (4, 7–10 partner) | No |
| Absence evidence | No | Yes (2 files) |
| Payslip / bank | No | Yes |
| Employer letter (sponsor) | No (in this sample) | Yes (`6`) |
| Marriage certificate | Yes | No |

---

## 4. How the app should treat routes (MVP)

1. **Classify** from `Product name/service` → `skilled_worker` or `ilr`.  
2. **Load fixed slot JSON** for that route (outcome trees above) — **do not build the client list from HO bullets alone**.  
3. **Merge ILR only:** if checklist adds lines (e.g. previous passports), **suggest one new slot** on staff review.  
4. **Skilled Worker:** if product mentions **dependant/partner**, enable **partner first name** + dependant slots; else strip partner/marriage/duplicate BRP rows.  
5. **Cover letter:** pick **SW docx** vs **ILR docx**; merge **UAN + names + dates**; ILR needs **extra staff fields** for narrative.  
6. **Zip:** same shape — `Documents/` (numbered files) + `Misc/` (original checklist PDF + any admin files).

---

## 5. One-line summary

- **Skilled Worker:** HO checklist is **minimal**; **multi-person relationship pack** and **early cover letter** define your folder; cover letter is **short and sponsor-linked**.  
- **ILR:** HO checklist is **detailed**; folder is **single applicant + employment/absence/financial proof** and **late cover letter**; cover letter is **long and case-specific** beyond what PDF parsing gives you.
