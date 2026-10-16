"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShellClient } from "@/components/shells/app-shell-client";
import { ClientNotFound } from "@/components/client/client-not-found";
import { ClientUnauthorized } from "@/components/client/client-unauthorized";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import {
  clientUploadProgress,
  isClientPortalLocked,
} from "@/lib/client-portal";
import { useClientCase } from "@/lib/use-client-case";
import { FIRM_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ClientDone({ token }: { token: string }) {
  const router = useRouter();
  const { caseRecord, ready, notFound, unauthorized } = useClientCase(token);

  const shouldRedirectToHub =
    ready &&
    !unauthorized &&
    !notFound &&
    caseRecord &&
    !isClientPortalLocked(caseRecord);

  useEffect(() => {
    if (!shouldRedirectToHub) {
      return;
    }
    router.replace(ROUTES.clientPortal(token));
  }, [shouldRedirectToHub, router, token]);

  if (!ready) {
    return null;
  }

  if (unauthorized) {
    return <ClientUnauthorized />;
  }

  if (notFound || !caseRecord) {
    return <ClientNotFound />;
  }

  if (shouldRedirectToHub) {
    return null;
  }

  const progress = clientUploadProgress(caseRecord);

  return (
    <AppShellClient
      applicantFirstName={caseRecord.applicantFirstName}
      completed={progress.completed}
      total={progress.total}
      homeHref={ROUTES.clientPortal(token)}
    >
      <div className="space-y-6 py-8 text-center">
        <h1 className="text-2xl font-semibold text-primary">Thank you</h1>
        <p className="text-sm text-muted-foreground">
          Your documents have been sent to {FIRM_NAME}. We will contact you if
          anything else is needed.
        </p>
        <Link
          href={ROUTES.clientPortal(token)}
          className={cn(buttonVariants({ variant: "outline" }), "min-h-11")}
        >
          View submitted checklist
        </Link>
      </div>
    </AppShellClient>
  );
}
