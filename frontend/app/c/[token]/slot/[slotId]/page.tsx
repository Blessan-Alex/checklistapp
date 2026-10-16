import { Suspense } from "react";
import { ClientSlotDetail } from "@/components/client/client-slot-detail";

async function ClientSlotContent({
  params,
}: {
  params: Promise<{ token: string; slotId: string }>;
}) {
  const { token, slotId } = await params;
  return <ClientSlotDetail token={token} slotId={slotId} />;
}

export default function ClientSlotPage({
  params,
}: {
  params: Promise<{ token: string; slotId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ClientSlotContent params={params} />
    </Suspense>
  );
}
