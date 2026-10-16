"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReplaceFileDialog({
  open,
  currentFileName,
  newFileName,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  currentFileName: string;
  newFileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Replace this file?</DialogTitle>
          <DialogDescription>
            You already uploaded{" "}
            <span className="font-medium text-foreground">{currentFileName}</span>
            . It will be replaced with{" "}
            <span className="font-medium text-foreground">{newFileName}</span>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" className="min-h-11" onClick={onCancel}>
            Keep current file
          </Button>
          <Button type="button" className="min-h-11" onClick={onConfirm}>
            Replace file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
