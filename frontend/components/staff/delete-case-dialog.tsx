"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-client";
import { useMockDataSource } from "@/lib/data-source";
import { useDeleteCaseMutation } from "@/lib/hooks/use-case-api";
import { deleteCaseRecord } from "@/lib/mock-store";
import type { Case } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DeleteCaseDialog({
  caseRecord,
  open,
  onOpenChange,
  onDeleted,
}: {
  caseRecord: Case;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const mockData = useMockDataSource();
  const deleteMutation = useDeleteCaseMutation();
  const [confirmName, setConfirmName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nameMatches =
    confirmName.trim().toLowerCase() ===
    caseRecord.applicantFullName.trim().toLowerCase();

  const busy = submitting || deleteMutation.isPending;

  function handleOpenChange(next: boolean) {
    if (!next && busy) {
      return;
    }
    if (!next) {
      setConfirmName("");
    }
    onOpenChange(next);
  }

  async function handleDelete() {
    if (!nameMatches) {
      return;
    }
    setSubmitting(true);
    try {
      if (mockData) {
        const removed = deleteCaseRecord(caseRecord.id);
        if (!removed) {
          toast.error("Could not delete case");
          return;
        }
      } else {
        await deleteMutation.mutateAsync({
          id: caseRecord.id,
          confirmName: confirmName.trim(),
        });
      }
      toast.success("Case deleted permanently");
      handleOpenChange(false);
      onDeleted();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not delete case",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>Permanently delete case</DialogTitle>
          <DialogDescription>
            This removes {caseRecord.applicantFullName}&apos;s checklist, all
            uploaded documents, review history, and the client portal link. This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="delete-confirm-name">
            Type the applicant&apos;s full name to confirm
          </Label>
          <input
            id="delete-confirm-name"
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={caseRecord.applicantFullName}
            className={cn(
              "flex h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
            autoComplete="off"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={busy}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            disabled={!nameMatches || busy}
            onClick={() => void handleDelete()}
          >
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
