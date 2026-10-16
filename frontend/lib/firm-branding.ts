/**
 * Firm branding from public env vars (no secrets).
 * See `docs/BRANDING.md` and `docs/CUSTOM-DOMAIN.md`.
 */
export interface FirmBranding {
  name: string;
  logoUrl: string;
  /** Public client portal hostname, e.g. documents.yourfirm.co.uk */
  clientPortalDomain: string;
  privacyPolicyUrl: string;
  contactEmail: string;
}

const DEFAULT_NAME = "L-Cedar Immigration";

export function getFirmBranding(): FirmBranding {
  return {
    name: process.env.NEXT_PUBLIC_FIRM_NAME?.trim() || DEFAULT_NAME,
    logoUrl:
      process.env.NEXT_PUBLIC_FIRM_LOGO_URL?.trim() || "/brand/firm-logo.svg",
    clientPortalDomain:
      process.env.NEXT_PUBLIC_CLIENT_PORTAL_DOMAIN?.trim() || "",
    privacyPolicyUrl:
      process.env.NEXT_PUBLIC_PRIVACY_URL?.trim() ||
      "https://www.gov.uk/help/privacy-policy",
    contactEmail:
      process.env.NEXT_PUBLIC_FIRM_CONTACT_EMAIL?.trim() ||
      "enquiries@lcedar.example",
  };
}
