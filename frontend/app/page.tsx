import Link from "next/link";
import { ROUTES } from "@/config/routes";

/** Root redirect is handled in `middleware.ts` (avoids PPR/instant-nav + `redirect()` noise). */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16 text-center">
      <p className="text-sm text-muted-foreground">
        Immigration document checklist
      </p>
      <Link
        href={ROUTES.staffLogin}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        Staff login
      </Link>
    </main>
  );
}
