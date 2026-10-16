# Deploy now — GitHub + Vercel + Firebase (`checklistapp-ab71c`)

Your Firebase **web** config is for browser apps. This Next.js app uses the **Firebase Admin SDK** on the server (already in the repo). You still need a **service account private key** for Vercel.

---

## 1. Service account (one time)

1. [Firebase Console](https://console.firebase.google.com/) → project **checklistapp-ab71c**
2. **Project settings** (gear) → **Service accounts**
3. **Generate new private key** → download JSON (keep secret, never commit)

From that JSON you will set on Vercel:

- `FIREBASE_PROJECT_ID` = `checklistapp-ab71c`
- `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-....@checklistapp-ab71c.iam.gserviceaccount.com`
- `FIREBASE_PRIVATE_KEY` = paste the `private_key` field (Vercel: use real newlines or `\n`)
Enable **Firestore** in the console if not already. **Files** use **Vercel Blob** (not Firebase Storage).

Lock rules (deny public access) — copy from [frontend/docs/FIREBASE-SETUP.md](frontend/docs/FIREBASE-SETUP.md).

---

## 2. Push to GitHub

In PowerShell:

```powershell
cd "c:\Users\blaze\Downloads\Checklist App"
git init
git add .
git commit -m "Checklist portal: Next.js app with Firebase backend support"
```

On GitHub: **New repository** (e.g. `checklist-app`) → no README.

```powershell
git remote add origin https://github.com/YOUR_USERNAME/checklist-app.git
git branch -M main
git push -u origin main
```

---

## 3. Vercel

1. [vercel.com/new](https://vercel.com/new) → Import the GitHub repo
2. **Root Directory:** `frontend` → **Deploy**
3. After first deploy: **Settings → Environment Variables** (Production):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_USE_MOCK_STORE` | `false` |
| `DATA_BACKEND` | `firebase` |
| `FIREBASE_PROJECT_ID` | `checklistapp-ab71c` |
| `FIREBASE_CLIENT_EMAIL` | from service account JSON |
| `FIREBASE_PRIVATE_KEY` | from service account JSON |
| `SESSION_SECRET` | long random string (32+ chars) |
| `STAFF_PASSWORD_HASH` | run `node frontend/scripts/hash-staff-password.mjs YourPassword` |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` |

4. **Storage → Blob** → create a **private** store → connect to this project (`BLOB_READ_WRITE_TOKEN` is set automatically)
5. Remove `FIREBASE_STORAGE_BUCKET` if you added it earlier
6. **Redeploy** (Deployments → … → Redeploy)

**Pitch-only demo (no Firebase):** set only `NEXT_PUBLIC_USE_MOCK_STORE=true` and skip Firebase vars.

---

## 4. Smoke test

- `https://YOUR-PROJECT.vercel.app/staff/login` — staff password you hashed
- Cases list → Dino → Publish → open client link
- Upload a file under **4 MB** → Finish → staff zip download

---

## Web SDK (`npm install firebase`)

Not required for this app. The console snippet is optional (e.g. Analytics). Server data uses `firebase-admin` only.
