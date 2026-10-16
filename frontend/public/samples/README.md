# Client sample images (demo)

Placeholder SVGs show clients what “good” uploads look like. Each slot’s `instructionType` maps to a file here via `lib/slot-instructions.ts`.

## Reference folder layouts (staff)

Real case folder screenshots from the repo live under:

- `Resources/Skilled worker dino dominic/Skilled worker documents.png` — Skilled Worker dependant pack (Dino + Aparna)
- `Resources/ILR sophy/documents structure ilr sophy.png` — ILR pack (Sophy)

Use those when explaining numbering and `targetFileName` rules to founders; this directory is what the **client UI** loads at `/samples/...`.

## Regenerating placeholders

```bash
node scripts/write-sample-svgs.mjs
```

After changing slot templates, regenerate mock JSON:

```bash
node scripts/generate-mock-cases.mjs
```
