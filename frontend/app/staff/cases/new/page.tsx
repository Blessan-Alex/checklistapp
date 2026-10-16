import { NewCaseUpload } from "@/components/staff/new-case-upload";
import { StaffAppShell } from "@/components/staff/staff-app-shell";

export const instant = false;

export default function StaffNewCasePage() {
  return (
    <StaffAppShell activeNav="new">
      <NewCaseUpload />
    </StaffAppShell>
  );
}
