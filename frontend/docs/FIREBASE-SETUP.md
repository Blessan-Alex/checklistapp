# Firebase (Spark free) + Vercel — production setup

Use this for **shared** case data and durable file storage on Vercel.

## Why this stack

| Piece | Choice | Reason |
|-------|--------|--------|
| **Host** | Vercel Hobby (free) | Native Next.js 16, previews per PR |
| **Database** | Firestore | JSON `Case` documents; Spark quotas |
| **Files** | **Vercel Blob** (private) | Checklist PDFs + client uploads |
| **Auth** | Staff cookie + `STAFF_PASSWORD_HASH` | No Firebase Auth required |

The app uses **Firestore for case JSON** and **Vercel Blob for files** when Firebase Admin env vars are set on Vercel.

---

## 1. Firebase project (Spark)

1. [Firebase Console](https://console.firebase.google.com/) → your project.
2. **Build → Firestore** → Create database → **Production mode**.
3. **Project settings → Service accounts** → **Generate new private key** (JSON).

You do **not** need Firebase Storage — files go to **Vercel Blob** (see §4).

From the JSON file, copy:

- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (paste with `\n` for newlines in Vercel)

---

## 2. Firestore index

On first publish, Firestore may prompt you to create an index from the error link. Or add:

- Collection: `portal_cases`
- Field: `clientToken` — Ascending

---

## 3. Security rules

Clients must **not** talk to Firestore directly. Only the Next.js API uses the Admin SDK.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Publish in the Firebase Console. Blob files are private and only accessed server-side.

---

## 4. Vercel environment variables

| Variable | Notes |
|----------|--------|
| `DATA_BACKEND` | `firebase` (optional if Firebase vars are set) |
| `FIREBASE_PROJECT_ID` | from service account |
| `FIREBASE_CLIENT_EMAIL` | from service account |
| `FIREBASE_PRIVATE_KEY` | escaped newlines |
| `BLOB_READ_WRITE_TOKEN` | Auto-set when Blob store is linked |
| `NEXT_PUBLIC_USE_BLOB_UPLOADS` | `true` |
| `SESSION_SECRET` | long random string |
| `STAFF_PASSWORD_HASH` | bcrypt hash |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

Generate password hash locally:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

Do **not** set `DATABASE_URL` or `STORAGE_PATH` on Vercel.

### Vercel Blob

1. Vercel project → **Storage** → **Blob** → **Private** store.
2. Connect to this project (`BLOB_READ_WRITE_TOKEN`).
3. Redeploy.

---

## 5. GitHub → Vercel

1. Push repo; import in Vercel.
2. **Root Directory:** `frontend`
3. Set env vars above; deploy.

---

## 6. Smoke test

1. `/staff/login` with your password.
2. Create case from checklist PDF → publish → client upload.
3. Staff review → zip download.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full env checklist.
