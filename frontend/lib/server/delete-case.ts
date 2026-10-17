import { deleteCaseBlobStorage } from "@/lib/server/case-blob-storage";
import { getServerCaseRepository } from "@/lib/server/case-repository-server";

export class CaseDeleteError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function deleteCasePermanently(caseId: string): Promise<void> {
  const repo = getServerCaseRepository();
  const caseRecord = await repo.getCaseById(caseId);
  if (!caseRecord) {
    throw new CaseDeleteError("Not found", 404);
  }

  try {
    await deleteCaseBlobStorage(caseId);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not delete case files from storage";
    throw new CaseDeleteError(message, 500);
  }

  const removed = await repo.deleteCase(caseId);
  if (!removed) {
    throw new CaseDeleteError("Not found", 404);
  }
}
