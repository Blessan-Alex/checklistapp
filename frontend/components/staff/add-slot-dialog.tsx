"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AddManualSlotInput } from "@/lib/add-manual-slot";
import type { Case } from "@/lib/types";

export function AddSlotDialog({
  open,
  onOpenChange,
  caseRecord,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseRecord: Case;
  onAdd: (input: AddManualSlotInput) => void;
}) {
  const nextNumber =
    caseRecord.slots.reduce((max, s) => Math.max(max, s.sortNumber), 0) + 1;

  const [sortNumber, setSortNumber] = useState(String(nextNumber));
  const [documentName, setDocumentName] = useState("");
  const [personFirstName, setPersonFirstName] = useState(
    caseRecord.applicantFirstName,
  );
  const [instructions, setInstructions] = useState("");

  function handleSubmit() {
    const trimmedName = documentName.trim();
    if (!trimmedName) {
      return;
    }
    const n = Number.parseInt(sortNumber, 10);
    onAdd({
      sortNumber: Number.isFinite(n) && n > 0 ? n : nextNumber,
      documentName: trimmedName,
      personFirstName: personFirstName.trim() || caseRecord.applicantFirstName,
      instructions: instructions.trim() || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add document slot</DialogTitle>
          <DialogDescription>
            Clients will see this row after you save (and on the portal if the
            case is already published).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="add-slot-number">Number</Label>
              <Input
                id="add-slot-number"
                inputMode="numeric"
                value={sortNumber}
                onChange={(e) => setSortNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-slot-first">First name (filenames)</Label>
              <Input
                id="add-slot-first"
                value={personFirstName}
                onChange={(e) => setPersonFirstName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-slot-name">Document name</Label>
            <Input
              id="add-slot-name"
              placeholder="e.g. Previous passports"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-slot-instructions">
              Instructions (optional)
            </Label>
            <textarea
              id="add-slot-instructions"
              rows={4}
              placeholder="Leave blank to use default copy for passport-style uploads."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className={cn(
                "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
              )}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="min-h-11"
            disabled={!documentName.trim()}
            onClick={handleSubmit}
          >
            Add slot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
