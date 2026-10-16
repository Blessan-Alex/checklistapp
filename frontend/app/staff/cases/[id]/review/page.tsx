import { StaffCaseReview } from "./staff-case-review";

export const instant = false;

export default function StaffCaseReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <StaffCaseReview params={params} />;
}
