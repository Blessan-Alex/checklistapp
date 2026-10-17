export const STAFF_API_SESSION_KEY = "staffApiSession";
export const STAFF_AUTH_VALUE = "1";

export function isStaffAuthed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return sessionStorage.getItem(STAFF_API_SESSION_KEY) === STAFF_AUTH_VALUE;
}

export function setStaffApiAuthed(): void {
  sessionStorage.setItem(STAFF_API_SESSION_KEY, STAFF_AUTH_VALUE);
}

export function clearStaffAuth(): void {
  sessionStorage.removeItem(STAFF_API_SESSION_KEY);
}
