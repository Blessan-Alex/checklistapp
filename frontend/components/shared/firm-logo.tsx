import Image from "next/image";
import Link from "next/link";
import { getFirmBranding } from "@/lib/firm-branding";
import { cn } from "@/lib/utils";

export function FirmLogo({
  href = "/",
  className,
  priority = false,
}: {
  href?: string;
  className?: string;
  /** Set on client header for faster LCP. */
  priority?: boolean;
}) {
  const { name, logoUrl } = getFirmBranding();

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center gap-2 font-semibold text-primary",
        className,
      )}
    >
      <Image
        src={logoUrl}
        alt={name}
        width={32}
        height={32}
        className="size-8 rounded-lg"
        priority={priority}
        unoptimized={logoUrl.startsWith("http")}
      />
      <span className="hidden sm:inline">{name}</span>
    </Link>
  );
}
