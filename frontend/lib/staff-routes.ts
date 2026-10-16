import { ROUTES } from "@/config/routes";
import type { Case } from "@/lib/types";

export function staffCaseHref(caseRecord: Case): string {
  if (caseRecord.status === "draft") {
    return ROUTES.staffCaseReview(caseRecord.id);
  }
  return ROUTES.staffCase(caseRecord.id);
}
