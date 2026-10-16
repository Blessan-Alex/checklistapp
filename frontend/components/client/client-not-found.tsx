import Link from "next/link";
import { FIRM_NAME } from "@/lib/constants";
import { ROUTES } from "@/config/routes";

/** Client portal — unknown token (404). */
export function ClientNotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Error 404
      </p>
      <h1 className="mt-2 text-xl font-semibold text-primary">Link not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This upload link may have expired or is incorrect. Please contact{" "}
        {FIRM_NAME} for a new link.
      </p>
      <Link
        href={ROUTES.staffLogin}
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
      >
        Staff login
      </Link>
    </main>
  );
}
