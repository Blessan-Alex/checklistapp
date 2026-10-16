import Link from "next/link";
import { getFirmBranding } from "@/lib/firm-branding";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: { className?: string }) {
  const brand = getFirmBranding();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t border-border bg-card/80 px-4 py-6 text-center text-xs text-muted-foreground",
        className,
      )}
    >
      <p>
        © {year}{" "}
        <span className="font-medium text-foreground">{brand.name}</span>
      </p>
      {brand.clientPortalDomain ? (
        <p className="mt-1">
          Secure uploads at{" "}
          <span className="font-mono text-foreground/80">
            {brand.clientPortalDomain}
          </span>
        </p>
      ) : null}
      <p className="mt-2">
        <Link
          href={brand.privacyPolicyUrl}
          className="underline underline-offset-2 hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy
        </Link>
        {brand.contactEmail ? (
          <>
            <span aria-hidden className="mx-2">·</span>
            <a
              href={`mailto:${brand.contactEmail}`}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Contact
            </a>
          </>
        ) : null}
      </p>
    </footer>
  );
}
