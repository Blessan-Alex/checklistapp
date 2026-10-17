"use client";

import { useState } from "react";
import { DoorOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import type { Case } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReopenCaseCard({
  caseRecord,
  onUpdated,
}: {
  caseRecord: Case;
  onUpdated?: () => void;
}) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canReopen =
    caseRecord.status === "submitted" ||
    caseRecord.status === "ready_to_zip" ||
    caseRecord.status === "zip_ready";

  if (!canReopen && !caseRecord.lastReopen) {
    return null;
  }

  async function handleReopen() {
    const trimmed = note.trim();
    if (!trimmed) {
      toast.error("Add a short note for the audit trail");
      return;
    }
    setSubmitting(true);
    try {
      await api.reopenCase(caseRecord.id, trimmed);
      setNote("");
      toast.success("Client portal reopened");
      onUpdated?.();
    } catch {
      toast.error("Could not reopen case");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DoorOpen className="size-4 text-primary" aria-hidden />
          Client portal
        </CardTitle>
        <CardDescription>
          Reopen after submission so the client can upload replacements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {caseRecord.lastReopen ? (
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Last reopened{" "}
            {new Intl.DateTimeFormat("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(caseRecord.lastReopen.reopenedAt))}
            : {caseRecord.lastReopen.note}
          </p>
        ) : null}
        {canReopen ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="reopen-note">Audit note</Label>
              <textarea
                id="reopen-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Client to replace passport scan per adviser call."
                className={cn(
                  "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              />
            </div>
            <Button
              type="button"
              className="min-h-11"
              disabled={submitting || !note.trim()}
              onClick={() => void handleReopen()}
            >
              Reopen for client uploads
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Portal is open — client can upload while the case is in progress.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
