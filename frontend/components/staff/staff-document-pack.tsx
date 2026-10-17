"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RejectSlotDialog } from "@/components/staff/reject-slot-dialog";
import { SlotTable } from "@/components/staff/slot-table";
import { api } from "@/lib/api-client";
import type { Case, Slot } from "@/lib/types";

export function StaffDocumentPack({
  caseRecord,
  onUpdated,
}: {
  caseRecord: Case;
  onUpdated?: () => void;
}) {
  const [rejectSlot, setRejectSlot] = useState<Slot | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  function openReject(slot: Slot) {
    setRejectSlot(slot);
    setRejectOpen(true);
  }

  async function handleRejectConfirm(message: string) {
    if (!rejectSlot) {
      return;
    }
    try {
      await api.rejectSlotUpload(caseRecord.id, rejectSlot.id, message);
      toast.success("Client notified on this slot");
      onUpdated?.();
    } catch {
      toast.error("Could not reject upload");
    }
  }

  return (
    <>
      <SlotTable
        slots={caseRecord.slots}
        showUploadStatus
        showStaffActions
        onRejectSlot={openReject}
      />
      <RejectSlotDialog
        open={rejectOpen}
        slot={rejectSlot}
        onOpenChange={setRejectOpen}
        onConfirm={(message) => void handleRejectConfirm(message)}
      />
    </>
  );
}
