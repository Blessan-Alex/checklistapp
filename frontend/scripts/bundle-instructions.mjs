import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "config/instructions/by-slot-type");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

let out =
  "// Auto-synced from config/instructions/by-slot-type/*.md\nexport const INSTRUCTIONS_FROM_MARKDOWN: Record<string, string> = {\n";

for (const file of files) {
  const type = file.replace(/\.md$/, "");
  const content = fs.readFileSync(path.join(dir, file), "utf8").trim();
  out += `  ${JSON.stringify(type)}: ${JSON.stringify(content)},\n`;
}

out += "};\n";

fs.writeFileSync(
  path.join(process.cwd(), "lib/instructions-bundled.ts"),
  out,
);

console.log(`Bundled ${files.length} slot instruction files.`);
