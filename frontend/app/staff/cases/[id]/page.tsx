import { StaffCaseDetail } from "./staff-case-detail";

export const instant = false;

export default function StaffCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <StaffCaseDetail params={params} />;
}
