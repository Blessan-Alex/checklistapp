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
import { Label } from "@/components/ui/label";
import type { Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RejectSlotDialog({
  open,
  slot,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  slot: Slot | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (message: string) => void;
}) {
  const [message, setMessage] = useState("");

  function handleOpenChange(next: boolean) {
    if (!next) {
      setMessage("");
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }
    onConfirm(trimmed);
    setMessage("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request replacement upload</DialogTitle>
          <DialogDescription>
            {slot
              ? `The client will see your message on “${slot.targetFileName}” and must upload again.`
              : "Ask the client to upload a new file."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reject-message">Message to client</Label>
          <textarea
            id="reject-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Passport photo is cropped — please retake with all four corners visible."
            className={cn(
              "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="min-h-11"
            disabled={!message.trim()}
            onClick={handleSubmit}
          >
            Send to client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
