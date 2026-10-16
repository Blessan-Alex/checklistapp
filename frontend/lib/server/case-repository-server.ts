import type { CaseRepository } from "@/lib/repositories/case-repository";
import { firestoreCaseRepository } from "@/lib/repositories/firestore-case-repository";
import { sqliteCaseRepository } from "@/lib/repositories/sqlite-case-repository";
import { getDataBackend } from "@/lib/server/data-backend";

export function getServerCaseRepository(): CaseRepository {
  return getDataBackend() === "firebase"
    ? firestoreCaseRepository
    : sqliteCaseRepository;
}
