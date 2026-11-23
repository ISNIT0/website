# Joe Reeve

Personal site. React 19 + Vite + Tailwind 4, prerendered to static HTML at build time
(`scripts/prerender.mjs`) so the page is fully there before JavaScript loads.

```bash
npm install
npm run dev      # Vite dev server
npm run build    # type-check, build to out/, prerender index.html and 404.html
npm run preview  # serve out/
```

Deployed on Netlify from `out/` (`netlify.toml`). `wrangler.jsonc` serves the same
`out/` as Cloudflare Workers static assets for the planned move; ship that via a
GitHub Action, not `wrangler deploy` from a laptop.
