import Link from "next/link";
import { MAX_CLIENT_FILE_BYTES } from "@/lib/constants";

const MAX_MB = Math.round(MAX_CLIENT_FILE_BYTES / (1024 * 1024));

/** Client portal — file over size limit (413). */
export function ClientPayloadTooLarge({
  backHref,
}: {
  backHref: string;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Error 413
      </p>
      <h1 className="mt-2 text-xl font-semibold text-primary">File too large</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Each document must be {MAX_MB} MB or smaller. Compress the file or
        choose a smaller export, then try again.
      </p>
      <Link
        href={backHref}
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Back to document
      </Link>
    </div>
  );
}
