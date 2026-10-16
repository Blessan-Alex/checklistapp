import { Suspense } from "react";
import { ClientFinish } from "@/components/client/client-finish";

async function ClientFinishContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ClientFinish token={token} />;
}

export default function ClientFinishPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ClientFinishContent params={params} />
    </Suspense>
  );
}
