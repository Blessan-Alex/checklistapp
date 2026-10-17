"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FirmLogo } from "@/components/shared/firm-logo";
import { cn } from "@/lib/utils";
import { LogOut, Plus } from "lucide-react";

export function AppShellStaff({
  children,
  activeNav,
  onLogout,
  className,
}: {
  children: React.ReactNode;
  activeNav?: "cases" | "new";
  onLogout?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-full flex-col bg-background", className)}>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex min-w-0 max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 sm:h-14 sm:flex-nowrap sm:gap-4 sm:px-4 sm:py-0">
          <FirmLogo href="/staff/cases" className="min-w-0 shrink" />
          <nav className="order-3 flex w-full min-w-0 items-center gap-1 sm:order-none sm:w-auto sm:gap-2">
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
          <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
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
      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
