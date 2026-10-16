"use client";

import Link from "next/link";
import { AppShellClient } from "@/components/shells/app-shell-client";
import { AdviserSlotRow } from "@/components/client/adviser-slot-row";
import { BeforeYouStart } from "@/components/client/before-you-start";
import { ExportInstructionsButton } from "@/components/client/export-instructions-button";
import { ClientNotFound } from "@/components/client/client-not-found";
import { ClientUnauthorized } from "@/components/client/client-unauthorized";
import { SlotCard } from "@/components/client/slot-card";
import { buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROUTES } from "@/config/routes";
import {
  allClientUploadsComplete,
  clientUploadProgress,
} from "@/lib/client-portal";
import { isSlotRejected } from "@/lib/slot-status";
import { useClientCase } from "@/lib/use-client-case";
import { cn } from "@/lib/utils";

export function ClientHub({
  token,
  generalInstructions,
}: {
  token: string;
  generalInstructions: string;
}) {
  const { caseRecord, ready, locked, offline, notFound, unauthorized } =
    useClientCase(token);

  if (!ready) {
    return (
      <AppShellClient
        applicantFirstName="…"
        completed={0}
        total={1}
        homeHref={ROUTES.clientPortal(token)}
      >
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          Loading your checklist…
        </p>
      </AppShellClient>
    );
  }

  if (unauthorized) {
    return <ClientUnauthorized />;
  }

  if (notFound || !caseRecord) {
    return <ClientNotFound />;
  }

  const progress = clientUploadProgress(caseRecord);
  const canFinish = allClientUploadsComplete(caseRecord) && !locked;
  const replacementSlots = caseRecord.slots.filter(
    (s) => s.clientUpload && isSlotRejected(s),
  );

  return (
    <AppShellClient
      applicantFirstName={caseRecord.applicantFirstName}
      completed={progress.completed}
      total={progress.total}
      homeHref={ROUTES.clientPortal(token)}
    >
      <div className={cn("space-y-6", canFinish && "pb-24")}>
        {offline ? (
          <Alert variant="destructive">
            <AlertTitle>Offline</AlertTitle>
            <AlertDescription>
              We could not load your checklist from the server. Check your
              connection and refresh the page.
            </AlertDescription>
          </Alert>
        ) : null}
        {locked ? (
          <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
            Thank you — your documents have been submitted. Your adviser will
            review them shortly.
          </p>
        ) : null}

        {!locked && replacementSlots.length > 0 ? (
          <Alert
            className="border-[var(--brand-golden-ochre)]/60 bg-[color-mix(in_srgb,var(--brand-golden-ochre)_12%,var(--brand-warm-ivory))]"
          >
            <AlertTitle>Action needed</AlertTitle>
            <AlertDescription>
              Your adviser has asked you to replace{" "}
              {replacementSlots.length === 1
                ? "one document"
                : `${replacementSlots.length} documents`}
              . Open the highlighted items below and upload new files.
            </AlertDescription>
          </Alert>
        ) : null}

        <BeforeYouStart content={generalInstructions} defaultOpen={false} />

        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-sm font-semibold text-primary">Your documents</h2>
            {!locked ? (
              <ExportInstructionsButton
                caseRecord={caseRecord}
                generalInstructions={generalInstructions}
                compact
              />
            ) : null}
          </div>
          <ul className="space-y-3">
            {caseRecord.slots.map((slot) => {
              if (!slot.clientUpload) {
                return (
                  <li key={slot.id}>
                    <AdviserSlotRow slot={slot} />
                  </li>
                );
              }
              return (
                <li key={slot.id}>
                  <SlotCard
                    slot={slot}
                    href={ROUTES.clientSlot(token, slot.id)}
                    disabled={locked}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {canFinish ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-lg flex-col gap-2">
            <Link
              href={ROUTES.clientFinish(token)}
              className={cn(
                buttonVariants({ variant: "default" }),
                "min-h-12 w-full text-base",
              )}
            >
              Finish and submit
            </Link>
          </div>
        </div>
      ) : null}
    </AppShellClient>
  );
}
