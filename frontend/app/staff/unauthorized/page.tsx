import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export const instant = false;

/** Staff session expired or invalid (401). */
export default function StaffUnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Error 401
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-primary">Sign in required</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Your staff session has expired or is invalid. Sign in again to continue.
      </p>
      <Link
        href={ROUTES.staffLogin}
        className={cn(buttonVariants({ variant: "default" }), "mt-8 min-h-11")}
      >
        Back to staff login
      </Link>
    </div>
  );
}
