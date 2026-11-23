# Joe Reeve

Personal site. React 19 + Vite + Tailwind 4, prerendered to static HTML at build time
(`scripts/prerender.mjs`) so the page is fully there before JavaScript loads.

```bash
npm install
npm run dev      # Vite dev server
npm run build    # type-check, build to out/, prerender index.html and 404.html
npm run preview  # serve out/
```

Deployed to Cloudflare Workers (static assets) by `.github/workflows/deploy.yml` on every
push to `master`: lint, build, `wrangler deploy`. `wrangler.jsonc` attaches simmsreeve.com and
www.simmsreeve.com as custom domains. Never `wrangler deploy` from a laptop.
