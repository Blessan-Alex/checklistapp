"use client";

import { useRouter } from "next/navigation";
import { AppShellStaff } from "@/components/shells/app-shell-staff";
import { ROUTES } from "@/config/routes";
import { api } from "@/lib/api-client";
import { staffSessionQueryKey } from "@/lib/hooks/use-staff-session";
import { useQueryClient } from "@tanstack/react-query";

export function StaffAppShell({
  children,
  activeNav,
}: {
  children: React.ReactNode;
  activeNav?: "cases" | "new";
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Still clear client session state if cookie clear fails.
    }
    queryClient.removeQueries({ queryKey: staffSessionQueryKey });
    router.push(ROUTES.staffLogin);
  }

  return (
    <AppShellStaff activeNav={activeNav} onLogout={() => void handleLogout()}>
      {children}
    </AppShellStaff>
  );
}
