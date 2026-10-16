import type { Case } from "@/lib/types";
import { buildSlotsFromRouteConfig } from "@/lib/slot-builder";
import { instructionForType } from "@/lib/instructions-registry";
import { ILR_SLOT_CONFIG, SKILLED_WORKER_SLOT_CONFIG } from "@/lib/route-config";

export function createDinoCase(): Case {
  const ctx = {
    route: "skilled_worker" as const,
    applicantFirstName: "Dino",
    partnerFirstName: "Aparna",
  };

  const slots = buildSlotsFromRouteConfig(
    SKILLED_WORKER_SLOT_CONFIG,
    ctx,
    (type) => instructionForType(type),
  );

  return {
    id: "case-dino",
    status: "draft",
    route: "skilled_worker",
    uan: "1212-0001-6479-0157",
    applicantFullName: "Dino Dominic",
    applicantFirstName: "Dino",
    title: "Mr",
    submittedDate: "2025-08-15",
    partnerFirstName: "Aparna",
    partnerFullName: "Aparna Dominic",
    dependantPack: true,
    staffNotes: "Skilled Worker dependant — partner Aparna. Demo case from Resources checklist.",
    archiveFolderName: "Dominic_Dino_1212-0001-6479-0157_Documents",
    clientToken: "demo-dino",
    checklistFileName: "Skilled worker checklist.pdf",
    productLine: "PBS — dependant partner (Skilled Worker)",
    updatedAt: "2026-10-14T16:30:00.000Z",
    slots,
  };
}

export function createSophyCase(): Case {
  const ctx = {
    route: "ilr" as const,
    applicantFirstName: "Sophy",
  };

  const slots = buildSlotsFromRouteConfig(
    ILR_SLOT_CONFIG,
    ctx,
    (type) => instructionForType(type),
  );

  return {
    id: "case-sophy",
    status: "draft",
    route: "ilr",
    uan: "1212-0001-6466-5462",
    applicantFullName: "Sophy Bijumon",
    applicantFirstName: "Sophy",
    title: "Mrs",
    submittedDate: "2026-09-07",
    dependantPack: false,
    staffNotes: "ILR SET(O) — demo case from Resources checklist.",
    archiveFolderName: "Bijumon_Sophy_1212-0001-6466-5462_Documents",
    clientToken: "demo-sophy",
    checklistFileName: "BIJUMON SOPHY 2026-09-07-10-48 Checklist (1).pdf",
    productLine: "Set (O) — ILR",
    updatedAt: "2026-10-13T09:15:00.000Z",
    checklistExtract:
      "Set (O) ILR checklist. Previous passports. Absence from UK.",
    slots,
  };
}
