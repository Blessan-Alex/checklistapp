"use client";

import { useRouter } from "next/navigation";
import { AppShellStaff } from "@/components/shells/app-shell-staff";
import { ROUTES } from "@/config/routes";
import { api } from "@/lib/api-client";
import { clearStaffAuth } from "@/lib/staff-auth";

export function StaffAppShell({
  children,
  activeNav,
}: {
  children: React.ReactNode;
  activeNav?: "cases" | "new";
}) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Still clear client session state if cookie clear fails.
    }
    clearStaffAuth();
    router.push(ROUTES.staffLogin);
  }

  return (
    <AppShellStaff activeNav={activeNav} onLogout={() => void handleLogout()}>
      {children}
    </AppShellStaff>
  );
}
