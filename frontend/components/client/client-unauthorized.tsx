import Link from "next/link";
import { FIRM_NAME } from "@/lib/constants";
import { ROUTES } from "@/config/routes";

/** Client portal — invalid or expired link (401). */
export function ClientUnauthorized() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Error 401
      </p>
      <h1 className="mt-2 text-xl font-semibold text-primary">
        This link is not valid
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We could not verify your upload link. Ask {FIRM_NAME} to send a fresh
        client link.
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
