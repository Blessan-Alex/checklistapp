import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientHub } from "@/components/client/client-hub";
import { FIRM_NAME } from "@/lib/constants";
import { getGeneralInstructionsMarkdown } from "@/lib/general-instructions";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Your documents — ${FIRM_NAME}`,
    description: "Upload immigration documents securely for your adviser.",
  };
}

async function ClientPortalContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const generalInstructions = getGeneralInstructionsMarkdown();

  return (
    <ClientHub token={token} generalInstructions={generalInstructions} />
  );
}

export default function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ClientPortalContent params={params} />
    </Suspense>
  );
}
