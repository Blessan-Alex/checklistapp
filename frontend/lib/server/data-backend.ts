export type DataBackend = "sqlite" | "firebase";

/**
 * Server persistence backend.
 * - `firebase` on Vercel when Firebase env vars are set (or DATA_BACKEND=firebase).
 * - `sqlite` for local API development.
 */
export function getDataBackend(): DataBackend {
  const explicit = process.env.DATA_BACKEND?.trim().toLowerCase();
  if (explicit === "firebase" || explicit === "sqlite") {
    return explicit;
  }
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return "firebase";
  }
  return "sqlite";
}

export function isFirebaseBackend(): boolean {
  return getDataBackend() === "firebase";
}
