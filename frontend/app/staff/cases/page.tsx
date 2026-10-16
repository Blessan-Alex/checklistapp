import { CasesList } from "@/components/staff/cases-list";
import { StaffAppShell } from "@/components/staff/staff-app-shell";

/** Auth-gated client UI — opt out of implicit instant-nav validation (Next 16). */
export const instant = false;

export default function StaffCasesPage() {
  return (
    <StaffAppShell activeNav="cases">
      <CasesList />
    </StaffAppShell>
  );
}
