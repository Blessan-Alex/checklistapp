import { Suspense } from "react";
import { ClientDone } from "@/components/client/client-done";

async function ClientDoneContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ClientDone token={token} />;
}

export default function ClientDonePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ClientDoneContent params={params} />
    </Suspense>
  );
}
