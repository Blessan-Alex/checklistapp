"use client";

import Link from "next/link";
import { AppShellClient } from "@/components/shells/app-shell-client";
import { AdviserSlotRow } from "@/components/client/adviser-slot-row";
import { BeforeYouStart } from "@/components/client/before-you-start";
import { ExportInstructionsButton } from "@/components/client/export-instructions-button";
import { ClientNotFound } from "@/components/client/client-not-found";
import { ClientUnauthorized } from "@/components/client/client-unauthorized";
import { SlotCard } from "@/components/client/slot-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROUTES } from "@/config/routes";
import {
  allClientUploadsComplete,
  canClientWriteSlot,
  caseHasOpenClientReplacements,
  clientUploadProgress,
  isClientPortalLocked,
} from "@/lib/client-portal";
import { isSlotRejected } from "@/lib/slot-status";
import { useClientCase } from "@/lib/use-client-case";
import type { Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

function sortHubSlots(slots: Slot[]): Slot[] {
  const adviser = slots.filter((s) => !s.clientUpload);
  const client = slots.filter((s) => s.clientUpload);
  const rejected = client.filter((s) => isSlotRejected(s));
  const rest = client.filter((s) => !isSlotRejected(s));
  return [...rejected, ...rest, ...adviser];
}

export function ClientHub({
  token,
  generalInstructions,
}: {
  token: string;
  generalInstructions: string;
}) {
  const { caseRecord, ready, locked, offline, notFound, unauthorized, refresh } =
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

  if (offline && !caseRecord) {
    return (
      <AppShellClient
        applicantFirstName="…"
        completed={0}
        total={1}
        homeHref={ROUTES.clientPortal(token)}
      >
        <Alert variant="destructive">
          <AlertTitle>Connection problem</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              We could not load your checklist from the server. Check your
              connection and try again.
            </p>
            <Button type="button" variant="outline" className="min-h-11" onClick={refresh}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </AppShellClient>
    );
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
              connection and refresh the page. When you are back online, open
              each document to upload or retry.
            </AlertDescription>
          </Alert>
        ) : null}
        {locked && !caseHasOpenClientReplacements(caseRecord) ? (
          <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
            We&apos;re reviewing your documents. You&apos;ll hear from your
            adviser if anything needs to change.
          </p>
        ) : null}

        {replacementSlots.length > 0 ? (
          <Alert
            className="border-[var(--brand-golden-ochre)]/60 bg-[color-mix(in_srgb,var(--brand-golden-ochre)_12%,var(--brand-warm-ivory))]"
          >
            <AlertTitle>Please replace highlighted items</AlertTitle>
            <AlertDescription>
              Your adviser needs{" "}
              {replacementSlots.length === 1
                ? "one new version"
                : `${replacementSlots.length} new versions`}
              . Start with the items at the top of the list.
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
            {sortHubSlots(caseRecord.slots).map((slot) => {
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
                    disabled={
                      isClientPortalLocked(caseRecord) &&
                      !canClientWriteSlot(caseRecord, slot)
                    }
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
