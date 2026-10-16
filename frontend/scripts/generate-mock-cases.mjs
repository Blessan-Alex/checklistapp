import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

function sanitizeFilename(name) {
  return name.replace(INVALID_FILENAME_CHARS, "").trim();
}

function buildTargetFileName({ route, sortNumber, documentName, personFirstName, filenameSuffix }) {
  const n = String(sortNumber);
  const person = personFirstName?.trim();
  const suffix = filenameSuffix?.trim();
  let base;
  if (route === "ilr" && person) {
    base = [n, person, documentName].join(" ");
  } else {
    const parts = [n, documentName];
    if (person) parts.push(person);
    base = parts.join(" ");
  }
  if (suffix) base = `${base} ${suffix}`;
  return sanitizeFilename(base);
}

function loadJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

const SAMPLE_URL_BY_INSTRUCTION_TYPE = {
  passport: "/samples/passport-four-edges.svg",
  sharecode: "/samples/sharecode-immigration-matter.svg",
  evisa: "/samples/evisa-dates-visible.svg",
  brp: "/samples/brp-example.svg",
  "ho-consent": "/samples/ho-consent-signed-example.svg",
  marriage: "/samples/marriage-cert.svg",
  cos: "/samples/cos-reference.svg",
  "absence-letter": "/samples/employer-letter.svg",
  "travel-ticket": "/samples/travel-ticket.svg",
  payslip: "/samples/payslip.svg",
  bank: "/samples/bank-statement.svg",
  "employer-letter": "/samples/employer-letter.svg",
};

function getSampleUrl(instructionType, clientUpload) {
  if (!clientUpload || instructionType === "cover-letter") return undefined;
  return SAMPLE_URL_BY_INSTRUCTION_TYPE[instructionType];
}

function resolvePerson(role, ctx) {
  if (role === "applicant") return ctx.applicantFirstName;
  if (role === "partner") return ctx.partnerFirstName;
  return undefined;
}

function instructionFromMd(type) {
  const map = {
    passport: "by-slot-type/passport.md",
    sharecode: "by-slot-type/sharecode.md",
    evisa: "by-slot-type/evisa.md",
    "ho-consent": "by-slot-type/ho-consent.md",
    brp: "by-slot-type/brp.md",
    cos: "by-slot-type/cos.md",
    marriage: "by-slot-type/marriage.md",
    "absence-letter": "by-slot-type/absence-letter.md",
    "travel-ticket": "by-slot-type/travel-ticket.md",
    payslip: "by-slot-type/payslip.md",
    bank: "by-slot-type/bank.md",
    "employer-letter": "by-slot-type/employer-letter.md",
    "cover-letter": "by-slot-type/cover-letter.md",
  };
  const file = map[type];
  if (!file) return { instructions: "", donts: [] };
  const instructions = readFileSync(
    join(root, "config", "instructions", file),
    "utf8",
  ).trim();
  const donts =
    type === "sharecode"
      ? ['Selecting "right to rent" or "right to work" instead of immigration matter']
      : [];
  return { instructions, donts };
}

function buildSlotsReal(config, ctx) {
  return config.slots.map((t) => {
    const personFirstName = resolvePerson(t.personRole, ctx);
    const { instructions, donts } = instructionFromMd(t.instructionType);
    return {
      id: t.id,
      sortNumber: t.sortNumber,
      documentName: t.documentName,
      personFirstName,
      targetFileName: buildTargetFileName({
        route: ctx.route,
        sortNumber: t.sortNumber,
        documentName: t.documentName,
        personFirstName,
        filenameSuffix: t.filenameSuffix,
      }),
      source: t.source,
      clientUpload: t.clientUpload,
      instructionType: t.instructionType,
      instructions,
      donts,
      sampleUrl: getSampleUrl(t.instructionType, t.clientUpload),
    };
  });
}

const sw = loadJson("config/routes/skilled-worker.slots.json");
const ilr = loadJson("config/routes/ilr.slots.json");

const dino = {
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
  staffNotes:
    "Skilled Worker dependant — partner Aparna. Demo case from Resources checklist.",
  archiveFolderName: "Dominic_Dino_1212-0001-6479-0157_Documents",
  clientToken: "demo-dino",
  checklistFileName: "Skilled worker checklist.pdf",
  productLine: "PBS — dependant partner (Skilled Worker)",
  updatedAt: "2026-10-14T16:30:00.000Z",
  slots: buildSlotsReal(sw, {
    route: "skilled_worker",
    applicantFirstName: "Dino",
    partnerFirstName: "Aparna",
  }),
};

const sophy = {
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
  slots: buildSlotsReal(ilr, {
    route: "ilr",
    applicantFirstName: "Sophy",
  }),
};

writeFileSync(
  join(root, "config/mock/case-dino.json"),
  JSON.stringify(dino, null, 2),
);
writeFileSync(
  join(root, "config/mock/case-sophy.json"),
  JSON.stringify(sophy, null, 2),
);

const share = dino.slots.find(
  (s) => s.documentName === "Sharecode" && s.personFirstName === "Dino",
);
const pass = sophy.slots.find((s) => s.sortNumber === 1);
console.log("share", share?.targetFileName);
console.log("pass", pass?.targetFileName);
console.log(
  "dino client uploads",
  dino.slots.filter((s) => s.clientUpload).length,
);
console.log(
  "sophy client uploads",
  sophy.slots.filter((s) => s.clientUpload).length,
);
