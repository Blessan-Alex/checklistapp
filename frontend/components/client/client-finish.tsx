"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShellClient } from "@/components/shells/app-shell-client";
import { ClientNotFound } from "@/components/client/client-not-found";
import { ClientUnauthorized } from "@/components/client/client-unauthorized";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ROUTES } from "@/config/routes";
import {
  allClientUploadsComplete,
  clientUploadProgress,
  isClientPortalLocked,
} from "@/lib/client-portal";
import { ApiError } from "@/lib/api-client";
import { useClientSubmitMutation } from "@/lib/hooks/use-case-api";
import { useClientCase } from "@/lib/use-client-case";
import { toast } from "sonner";
import { CheckCircle2, Circle } from "lucide-react";

export function ClientFinish({ token }: { token: string }) {
  const router = useRouter();
  const submitMutation = useClientSubmitMutation(token);
  const { caseRecord, ready, notFound, unauthorized, offline, refresh } =
    useClientCase(token);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const locked =
    ready && caseRecord && !notFound && !unauthorized
      ? isClientPortalLocked(caseRecord)
      : false;

  useEffect(() => {
    if (!locked) {
      return;
    }
    router.replace(ROUTES.clientDone(token));
  }, [locked, router, token]);

  if (!ready) {
    return null;
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
              We could not load your checklist. Check your connection and try
              again.
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

  if (locked) {
    return null;
  }

  const progress = clientUploadProgress(caseRecord);
  const complete = allClientUploadsComplete(caseRecord);
  const uploadSlots = caseRecord.slots.filter((s) => s.clientUpload);

  function handleSubmit() {
    if (!complete || !confirmed || !caseRecord || submitting) {
      return;
    }
    setSubmitting(true);
    void submitMutation
      .mutateAsync()
      .then(() => {
        router.push(ROUTES.clientDone(token));
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof ApiError ? error.message : "Could not submit.",
        );
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <AppShellClient
      applicantFirstName={caseRecord.applicantFirstName}
      completed={progress.completed}
      total={progress.total}
      homeHref={ROUTES.clientPortal(token)}
    >
      <div className="space-y-6">
        <div>
          <Link
            href={ROUTES.clientPortal(token)}
            className="mb-2 inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-medium text-primary hover:bg-muted"
          >
            ← Back to checklist
          </Link>
          <h1 className="text-xl font-semibold text-primary">
            Review and submit
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Check every document before you finish.
          </p>
        </div>

        <ul className="space-y-2 rounded-xl border border-border bg-card p-4">
          {uploadSlots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center gap-3 text-sm"
            >
              {slot.upload ? (
                <CheckCircle2
                  className="size-5 shrink-0 text-[var(--brand-rich-violet)]"
                  aria-hidden
                />
              ) : (
                <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span className="min-w-0 flex-1 truncate font-medium">
                {slot.targetFileName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {slot.upload?.name ?? "Missing"}
              </span>
            </li>
          ))}
        </ul>

        <label className="flex min-h-11 items-start gap-3 rounded-lg border border-border px-3 py-3">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(v === true)}
            disabled={!complete}
            className="mt-0.5"
          />
          <span className="text-sm leading-snug text-foreground">
            I confirm all documents meet the requirements of this list and the
            Home Office checklist provided to me.
          </span>
        </label>

        <Button
          type="button"
          className="min-h-12 w-full"
          disabled={!complete || !confirmed || submitting}
          onClick={handleSubmit}
        >
          Submit documents
        </Button>

        {!complete ? (
          <p className="text-center text-xs text-muted-foreground">
            Upload every required document before you can submit.
          </p>
        ) : null}
      </div>
    </AppShellClient>
  );
}
