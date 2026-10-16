export const STAFF_AUTH_STORAGE_KEY = "staffAuth";
export const STAFF_AUTH_VALUE = "1";
export const STAFF_API_SESSION_KEY = "staffApiSession";

export function isStaffAuthed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (process.env.NEXT_PUBLIC_USE_MOCK_STORE !== "false") {
    return sessionStorage.getItem(STAFF_AUTH_STORAGE_KEY) === STAFF_AUTH_VALUE;
  }
  return sessionStorage.getItem(STAFF_API_SESSION_KEY) === STAFF_AUTH_VALUE;
}

export function setStaffAuthed(): void {
  sessionStorage.setItem(STAFF_AUTH_STORAGE_KEY, STAFF_AUTH_VALUE);
}

export function setStaffApiAuthed(): void {
  sessionStorage.setItem(STAFF_API_SESSION_KEY, STAFF_AUTH_VALUE);
}

export function clearStaffAuth(): void {
  sessionStorage.removeItem(STAFF_AUTH_STORAGE_KEY);
  sessionStorage.removeItem(STAFF_API_SESSION_KEY);
}

/** Mock-mode login accepts any password. API mode uses POST /api/auth/login. */
export function validateStaffLoginPassword(password: string): boolean {
  void password;
  return true;
}
