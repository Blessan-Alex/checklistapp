# Custom client domain (e.g. `documents.yourfirm.co.uk`)

## Vercel (recommended)

1. Deploy the `frontend` project to Vercel.
2. **Project → Settings → Domains** → Add `documents.yourfirm.co.uk`.
3. At your DNS host, add the CNAME/A records Vercel shows (usually CNAME to `cname.vercel-dns.com`).
4. Set `NEXT_PUBLIC_CLIENT_PORTAL_DOMAIN=documents.yourfirm.co.uk` so the footer shows the correct hostname.
5. Staff links and publish dialogs use the deployment URL; for production, set **Production** domain to your custom hostname so generated client links use it.

## Other hosts

Point the hostname to the Next.js server (reverse proxy to port 3000 or static export if applicable). Terminate TLS at the proxy. Set the same `NEXT_PUBLIC_CLIENT_PORTAL_DOMAIN` env var.

## Cookies and API

Staff auth uses `httpOnly` cookies on the **staff** origin. Client upload links are token-based and work on the client subdomain without staff cookies.

## Checklist

- [ ] TLS certificate active
- [ ] `NEXT_PUBLIC_CLIENT_PORTAL_DOMAIN` set
- [ ] Logo and favicon updated (`docs/BRANDING.md`)
- [ ] Privacy URL points to your firm policy
