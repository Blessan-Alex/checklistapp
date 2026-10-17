import { ROUTES } from "@/config/routes";

/** Full client portal URL for sharing (uses current origin in the browser). */
export function clientPortalAbsoluteUrl(token: string): string {
  if (typeof window === "undefined") {
    return ROUTES.clientPortal(token);
  }
  return `${window.location.origin}${ROUTES.clientPortal(token)}`;
}
