"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteCaseDialog } from "@/components/staff/delete-case-dialog";
import type { Case } from "@/lib/types";

export function DeleteCaseCard({
  caseRecord,
  onDeleted,
}: {
  caseRecord: Case;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete this case and every file stored for it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            onClick={() => setOpen(true)}
          >
            Delete this case
          </Button>
        </CardContent>
      </Card>
      <DeleteCaseDialog
        caseRecord={caseRecord}
        open={open}
        onOpenChange={setOpen}
        onDeleted={onDeleted}
      />
    </>
  );
}
