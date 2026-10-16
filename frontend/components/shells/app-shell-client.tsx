import { FirmLogo } from "@/components/shared/firm-logo";
import { SiteFooter } from "@/components/shared/site-footer";
import { ProgressRing } from "@/components/shared/progress-ring";
import { cn } from "@/lib/utils";

export function AppShellClient({
  applicantFirstName,
  completed,
  total,
  homeHref = "/",
  children,
  className,
}: {
  applicantFirstName: string;
  completed: number;
  total: number;
  homeHref?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-full flex-col bg-background", className)}>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-lg items-center justify-between gap-3 px-4 py-2">
          <FirmLogo href={homeHref} className="text-sm" priority />
          <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
            <p className="truncate text-sm font-semibold text-foreground">
              Documents for {applicantFirstName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Progress</span>
              <ProgressRing completed={completed} total={total} size={40} />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">{children}</main>
      <SiteFooter className="print:hidden" />
    </div>
  );
}
