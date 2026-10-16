# Firm branding (Prompt 4.1)

Configure the client portal and staff UI without code changes.

## Environment variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_FIRM_NAME` | Header, footer, emails | `Document upload` |
| `NEXT_PUBLIC_FIRM_LOGO_URL` | Logo image URL or path under `public/` | `/brand/firm-logo.svg` |
| `NEXT_PUBLIC_CLIENT_PORTAL_DOMAIN` | Shown in footer (custom domain) | (empty) |
| `NEXT_PUBLIC_PRIVACY_URL` | Footer privacy link | GOV.UK privacy placeholder |
| `NEXT_PUBLIC_FIRM_CONTACT_EMAIL` | Footer mailto link | (empty — set to show Contact) |

## Logo upload

1. Export your logo as **SVG** or **PNG** (square, ≥ 128×128).
2. Place it in `frontend/public/brand/` (e.g. `firm-logo.png`).
3. Set `NEXT_PUBLIC_FIRM_LOGO_URL=/brand/firm-logo.png` in `.env.local`.
4. Redeploy or restart `npm run dev`.

Remote URLs are supported (`https://…`) for CDN-hosted assets.

## Favicon

Replace `app/icon.svg` (and optional `app/apple-icon.png`) with your mark. Next.js serves these automatically.

## Client instructions PDF

On the client hub, **Save instructions (PDF)** opens a print-ready page. Use the browser **Print → Save as PDF** dialog.

## Lighthouse (Prompt 4.1 VERIFY)

On a production build, audit the demo client hub:

```bash
npm run build && npm run start
# In another terminal:
npx lighthouse http://localhost:3000/c/demo-dino --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility
```

Target **mobile performance ≥ 90** on `/c/demo-dino`. SSR uses seeded demo cases when `NEXT_PUBLIC_USE_MOCK_STORE` is unset/true.
