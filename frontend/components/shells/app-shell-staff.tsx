"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FirmLogo } from "@/components/shared/firm-logo";
import { cn } from "@/lib/utils";
import { LogOut, Plus } from "lucide-react";

export function AppShellStaff({
  children,
  activeNav,
  onLogout,
  demoToolbar,
  className,
}: {
  children: React.ReactNode;
  activeNav?: "cases" | "new";
  onLogout?: () => void;
  demoToolbar?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-full flex-col bg-background", className)}>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <FirmLogo href="/staff/cases" />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/staff/cases"
              className={cn(
                "inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition",
                activeNav === "cases"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              Cases
            </Link>
            <Link
              href="/staff/cases/new"
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition",
                activeNav === "new"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Plus className="size-4" aria-hidden />
              <span className="hidden sm:inline">New case</span>
              <span className="sm:hidden">New</span>
            </Link>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            {demoToolbar}
            {!demoToolbar ? (
              <Badge
                variant="outline"
                className="hidden border-[var(--brand-golden-ochre)] bg-[color-mix(in_srgb,var(--brand-golden-ochre)_15%,var(--brand-warm-ivory))] text-[var(--brand-dark-indigo)] sm:inline-flex"
              >
                Demo
              </Badge>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11 gap-2"
              onClick={onLogout}
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
