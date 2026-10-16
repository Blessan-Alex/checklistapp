import type { Route } from "@/lib/types";
import { UnsupportedChecklistError, UNSUPPORTED_CHECKLIST_MESSAGE } from "@/lib/checklist-parse-errors";

const UNSUPPORTED_HINTS = [
  "naturalisation",
  "naturalization",
  "british citizenship",
  "citizenship application",
  "family member",
  "fm extension",
  "partner route",
  "parent route",
  "child route",
  "adult dependant",
  "student",
  "visitor",
  "tier 4",
  "graduate route",
  "global talent",
  "innovator",
  "start-up",
  "startup",
];

const ILR_HINTS = [
  "set (o)",
  "set(o)",
  "settlement",
  "indefinite leave",
  " ilr",
  "ilr ",
  "leave to remain",
  "set (m)",
  "set(m)",
  "set (p)",
  "set(p)",
];

const SKILLED_WORKER_HINTS = [
  "skilled worker",
  "health and care",
  "health & care",
  "pbs",
  "points-based",
  "dependant",
  "dependent",
  "partner of",
  "spouse",
];

/**
 * Classify UKVI product line + filename into supported routes only.
 * @throws UnsupportedChecklistError when not SW or ILR
 */
export function classifyChecklistRoute(
  productLine: string,
  fileName: string,
): Route {
  const blob = `${productLine} ${fileName}`.toLowerCase();

  for (const hint of UNSUPPORTED_HINTS) {
    if (blob.includes(hint)) {
      throw new UnsupportedChecklistError(UNSUPPORTED_CHECKLIST_MESSAGE);
    }
  }

  const isIlr = ILR_HINTS.some((hint) => blob.includes(hint));
  const isSw = SKILLED_WORKER_HINTS.some((hint) => blob.includes(hint));

  if (isIlr && !isSw) {
    return "ilr";
  }
  if (isSw && !isIlr) {
    return "skilled_worker";
  }
  if (isIlr && isSw) {
    if (blob.includes("skilled worker") || blob.includes("pbs")) {
      return "skilled_worker";
    }
    return "ilr";
  }

  throw new UnsupportedChecklistError(UNSUPPORTED_CHECKLIST_MESSAGE);
}
