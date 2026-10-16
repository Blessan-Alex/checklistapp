"use client";

import { useRouter } from "next/navigation";
import { AppShellStaff } from "@/components/shells/app-shell-staff";
import { DemoCaseSwitcher } from "@/components/staff/demo-case-switcher";
import { ROUTES } from "@/config/routes";
import { api } from "@/lib/api-client";
import { useMockDataSource } from "@/lib/data-source";
import { clearStaffAuth } from "@/lib/staff-auth";

export function StaffAppShell({
  children,
  activeNav,
  showDemoSwitcher = true,
}: {
  children: React.ReactNode;
  activeNav?: "cases" | "new";
  showDemoSwitcher?: boolean;
}) {
  const router = useRouter();
  const mockData = useMockDataSource();
  const demoToolbar =
    showDemoSwitcher && mockData ? <DemoCaseSwitcher /> : undefined;

  async function handleLogout() {
    if (!mockData) {
      try {
        await api.logout();
      } catch {
        // Still clear client session state if cookie clear fails.
      }
    }
    clearStaffAuth();
    router.push(ROUTES.staffLogin);
  }

  return (
    <AppShellStaff
      activeNav={activeNav}
      onLogout={() => void handleLogout()}
      demoToolbar={demoToolbar}
    >
      {children}
    </AppShellStaff>
  );
}
