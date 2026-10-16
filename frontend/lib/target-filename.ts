import type { Route } from "@/lib/types";

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

/** Remove characters invalid on Windows filesystems (PRODUCT-SPEC §11). */
export function sanitizeFilename(name: string): string {
  return name.replace(INVALID_FILENAME_CHARS, "").trim();
}

export interface TargetFileNameInput {
  route: Route;
  sortNumber: number;
  documentName: string;
  personFirstName?: string;
  filenameSuffix?: string;
}

/**
 * Skilled Worker: `{n} {documentName} {personFirstName?}` (+ optional suffix).
 * ILR (person-specific): `{n} {personFirstName} {documentName}` — e.g. `1 Sophy Passport`.
 * ILR (shared): `{n} {documentName}` — e.g. `5 Bank statement`.
 */
export function buildTargetFileName(input: TargetFileNameInput): string {
  const {
    route,
    sortNumber,
    documentName,
    personFirstName,
    filenameSuffix,
  } = input;
  const n = String(sortNumber);
  const person = personFirstName?.trim();
  const suffix = filenameSuffix?.trim();

  let base: string;
  if (route === "ilr" && person) {
    base = [n, person, documentName].join(" ");
  } else {
    const parts = [n, documentName];
    if (person) {
      parts.push(person);
    }
    base = parts.join(" ");
  }

  if (suffix) {
    base = `${base} ${suffix}`;
  }

  return sanitizeFilename(base);
}
