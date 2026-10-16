import { NextResponse } from "next/server";
import {
  ClientCaseError,
  getClientCaseForPortal,
} from "@/lib/server/client-case-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  try {
    const caseRecord = await getClientCaseForPortal(token);
    return NextResponse.json({ case: caseRecord });
  } catch (error) {
    if (error instanceof ClientCaseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
