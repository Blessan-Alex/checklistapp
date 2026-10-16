import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "samples");
mkdirSync(outDir, { recursive: true });

const colors = {
  ivory: "#FBF9E5",
  indigo: "#21173F",
  purple: "#4D1B7A",
  violet: "#621D92",
  lavender: "#9860C6",
  ochre: "#E3A72E",
};

function frame(title, subtitle, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" role="img">
  <title>${title}</title>
  <rect width="800" height="500" fill="${colors.ivory}"/>
  <rect x="0" y="0" width="800" height="56" fill="${colors.purple}"/>
  <text x="24" y="36" fill="${colors.ivory}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700">${title}</text>
  <text x="24" y="88" fill="${colors.indigo}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="600">${subtitle}</text>
  ${body}
  <text x="24" y="478" fill="${colors.lavender}" font-family="Arial, Helvetica, sans-serif" font-size="12">Demo placeholder — redacted example for client guidance</text>
</svg>`;
}

const files = {
  "passport-four-edges.svg": frame(
    "Passport photo example",
    "All four edges visible · plain background · no glare",
    `<rect x="120" y="120" width="560" height="320" rx="8" fill="#fff" stroke="${colors.lavender}" stroke-width="3" stroke-dasharray="12 6"/>
     <rect x="160" y="160" width="200" height="240" rx="4" fill="${colors.lavender}" opacity="0.35"/>
     <text x="400" y="280" text-anchor="middle" fill="${colors.indigo}" font-family="Arial" font-size="14">MRZ &amp; photo readable</text>
     <circle cx="100" cy="130" r="10" fill="${colors.ochre}"/><text x="118" y="135" fill="${colors.indigo}" font-size="13" font-family="Arial">Corner markers</text>`,
  ),
  "sharecode-immigration-matter.svg": frame(
    "Share code — correct GOV.UK option",
    'Select “To prove an immigration matter”',
    `<rect x="80" y="120" width="640" height="280" rx="12" fill="#fff" stroke="${colors.violet}" stroke-width="2"/>
     <rect x="100" y="150" width="600" height="48" rx="6" fill="#f3eef8"/>
     <text x="120" y="180" fill="${colors.indigo}" font-family="Arial" font-size="15">Right to rent</text>
     <rect x="100" y="210" width="600" height="48" rx="6" fill="#f3eef8"/>
     <text x="120" y="240" fill="${colors.indigo}" font-family="Arial" font-size="15">Right to work</text>
     <rect x="100" y="270" width="600" height="56" rx="6" fill="${colors.ochre}" opacity="0.35" stroke="${colors.ochre}" stroke-width="3"/>
     <text x="120" y="304" fill="${colors.purple}" font-family="Arial" font-size="16" font-weight="700">To prove an immigration matter ✓</text>
     <text x="120" y="330" fill="${colors.indigo}" font-family="Arial" font-size="13">Prove immigration status for something else</text>`,
  ),
  "evisa-dates-visible.svg": frame(
    "eVisa screenshot",
    "Start date and expiry date must be visible",
    `<rect x="140" y="130" width="520" height="300" rx="10" fill="#fff" stroke="${colors.purple}" stroke-width="2"/>
     <text x="180" y="200" fill="${colors.indigo}" font-family="Arial" font-size="18" font-weight="600">Digital status</text>
     <text x="180" y="240" fill="${colors.violet}" font-family="Arial" font-size="15">Valid from: 01 Jan 2024</text>
     <text x="180" y="270" fill="${colors.violet}" font-family="Arial" font-size="15">Valid until: 01 Jan 2029</text>
     <rect x="180" y="220" width="200" height="60" fill="none" stroke="${colors.ochre}" stroke-width="3"/>`,
  ),
  "brp-example.svg": frame(
    "BRP example",
    "Front of card — four edges visible",
    `<rect x="200" y="150" width="400" height="250" rx="16" fill="linear-gradient" stroke="${colors.purple}" stroke-width="3"/>
     <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${colors.purple}"/><stop offset="100%" stop-color="${colors.violet}"/></linearGradient></defs>
     <rect x="200" y="150" width="400" height="250" rx="16" fill="url(#g)"/>
     <text x="400" y="280" text-anchor="middle" fill="${colors.ivory}" font-family="Arial" font-size="22" font-weight="700">BRP</text>
     <text x="400" y="310" text-anchor="middle" fill="${colors.ivory}" font-family="Arial" font-size="13">Card number redacted</text>`,
  ),
  "ho-consent-signed-example.svg": frame(
    "Home Office consent — signed page 1",
    "Full name · address · postcode · date · signature",
    `<rect x="100" y="120" width="600" height="300" rx="8" fill="#fff" stroke="${colors.lavender}" stroke-width="2"/>
     <line x1="130" y1="170" x2="670" y2="170" stroke="${colors.lavender}" stroke-width="2"/>
     <line x1="130" y1="220" x2="670" y2="220" stroke="${colors.lavender}" stroke-width="2"/>
     <path d="M 130 360 Q 220 320 300 360 T 480 340" fill="none" stroke="${colors.purple}" stroke-width="3"/>
     <text x="130" y="390" fill="${colors.indigo}" font-family="Arial" font-size="14">Signature + date completed</text>`,
  ),
  "marriage-cert.svg": frame(
    "Marriage certificate",
    "Official register copy — all text readable",
    `<rect x="160" y="110" width="480" height="330" rx="6" fill="#fff" stroke="${colors.ochre}" stroke-width="3"/>
     <text x="400" y="200" text-anchor="middle" fill="${colors.purple}" font-family="Arial" font-size="20" font-weight="700">Marriage Certificate</text>
     <text x="400" y="260" text-anchor="middle" fill="${colors.indigo}" font-family="Arial" font-size="14">Registrar seal · names · date</text>`,
  ),
  "bank-statement.svg": frame(
    "Bank statement",
    "Shows payment matching payslip",
    `<rect x="80" y="120" width="640" height="300" rx="8" fill="#fff" stroke="${colors.violet}" stroke-width="2"/>
     <text x="100" y="160" fill="${colors.indigo}" font-family="Arial" font-size="16" font-weight="600">Account statement</text>
     <rect x="100" y="200" width="520" height="28" fill="${colors.lavender}" opacity="0.25"/>
     <text x="110" y="220" fill="${colors.indigo}" font-family="Arial" font-size="13">Salary deposit — highlighted row</text>`,
  ),
  "payslip.svg": frame(
    "Payslip",
    "Dated within one calendar month of application",
    `<rect x="120" y="130" width="560" height="280" rx="8" fill="#fff" stroke="${colors.purple}" stroke-width="2"/>
     <text x="150" y="180" fill="${colors.indigo}" font-family="Arial" font-size="16" font-weight="600">Payslip</text>
     <text x="150" y="220" fill="${colors.violet}" font-family="Arial" font-size="14">Pay date: 15 Aug 2026</text>
     <text x="150" y="250" fill="${colors.violet}" font-family="Arial" font-size="14">Net pay: £ ———</text>`,
  ),
  "employer-letter.svg": frame(
    "Employer letter",
    "On letterhead · signed · dated",
    `<rect x="100" y="120" width="600" height="300" rx="8" fill="#fff" stroke="${colors.lavender}" stroke-width="2"/>
     <text x="130" y="160" fill="${colors.purple}" font-family="Arial" font-size="18" font-weight="700">Employer Ltd</text>
     <text x="130" y="220" fill="${colors.indigo}" font-family="Arial" font-size="14">Re: employment / absence confirmation</text>
     <text x="130" y="360" fill="${colors.indigo}" font-family="Arial" font-size="14">Signed — Authorised signatory</text>`,
  ),
  "travel-ticket.svg": frame(
    "Travel ticket",
    "Shows dates outside the UK",
    `<rect x="120" y="140" width="560" height="260" rx="10" fill="#fff" stroke="${colors.ochre}" stroke-width="2"/>
     <text x="150" y="190" fill="${colors.indigo}" font-family="Arial" font-size="16" font-weight="600">Flight / travel booking</text>
     <text x="150" y="230" fill="${colors.violet}" font-family="Arial" font-size="14">Departure: ——</text>
     <text x="150" y="260" fill="${colors.violet}" font-family="Arial" font-size="14">Return: ——</text>`,
  ),
  "cos-reference.svg": frame(
    "Certificate of Sponsorship",
    "CoS reference or employer pending letter",
    `<rect x="140" y="130" width="520" height="280" rx="8" fill="#fff" stroke="${colors.purple}" stroke-width="2"/>
     <text x="180" y="190" fill="${colors.indigo}" font-family="Arial" font-size="16" font-weight="600">CoS reference / pending</text>
     <text x="180" y="230" fill="${colors.violet}" font-family="Arial" font-size="14">Employer confirmation if not yet issued</text>`,
  ),
};

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(outDir, name), svg, "utf8");
}

console.log(`Wrote ${Object.keys(files).length} samples to ${outDir}`);
