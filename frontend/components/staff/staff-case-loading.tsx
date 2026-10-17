"use client";

import { StaffAppShell } from "@/components/staff/staff-app-shell";
import { Loader2 } from "lucide-react";

export function StaffCaseLoading() {
  return (
    <StaffAppShell activeNav="cases">
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2
          className="size-8 animate-spin text-primary"
          aria-label="Loading case"
        />
      </div>
    </StaffAppShell>
  );
}
