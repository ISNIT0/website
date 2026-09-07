# simmsreeve.com

Personal site for Joe Reeve. Hand-written static HTML, styled with Tailwind CSS
v4 via the Tailwind CLI. No framework, no client-side JavaScript beyond
analytics.

## Commands

```bash
npm install
npm run build     # writes dist/
npm run dev       # builds HTML once, then watches CSS
npm run serve     # build, then serve dist/ locally
npm run clean     # delete dist/
```

`dist/` is generated and git-ignored. Never edit it by hand.

## Layout

```
src/
├── index.html          # homepage
├── publications.html   # builds to /publications/
├── partials/           # head, nav, footer — shared by both pages
├── styles/main.css     # Tailwind entry, @theme tokens, @font-face, @utility
└── static/             # copied verbatim to the root of dist/
    ├── fonts/          # self-hosted Inria Serif
    ├── img/
    ├── assets/analytics.js
    ├── favicon.svg, apple-touch-icon.png, og.png
    └── robots.txt
build.mjs               # include resolver + static copy + sitemap. No deps.
tools/                  # HTML sources for the OG image and touch icon
```

## How the build works

`build.mjs` is about 150 lines and has no dependencies. It does three things:

1. Reads the optional `<!-- vars ... -->` block at the top of each page and
   substitutes `{{key}}` placeholders. `canonical`, `origin` and `year` are
   injected automatically.
2. Replaces `<!-- include: partials/x.html -->` with the partial's contents,
   re-indenting it to match so the built markup stays readable.
3. Copies `src/static/**` into `dist/` and writes `sitemap.xml` from the page
   list.

Then the Tailwind CLI compiles `src/styles/main.css` to
`dist/assets/main.css`.

To add a page, create `src/whatever.html` and add an entry to the `pages` array
in `build.mjs`.

## Design constraints

- **Inria Serif only, at weights 300, 400 and 700.** The family has no 500 or
  600 — using those makes the browser synthesise a fake weight, which looks
  wrong. There is a check for this in the verification step below.
- Pure black on pure white, Tailwind's grey scale for secondary text and
  hairline rules. No brand colour.
- Two custom utilities in `main.css`: `eyebrow` (small uppercase section label,
  colour left to the caller) and `link` / `row-link` (editorial underlines).
- Press wordmarks live in `src/static/img/press/` and are self-hosted SVGs,
  each linking to a representative article.

## Adding an outbound link

Every `target="_blank"` anchor must carry `rel="noopener noreferrer"`. To check
the whole site:

```bash
npm run build
python3 - <<'PY'
import re, glob
for path in glob.glob("dist/**/*.html", recursive=True):
    html = open(path, encoding="utf8").read()
    for m in re.finditer(r'<a\b[^>]*>', html, re.S):
        tag = m.group(0)
        if 'target="_blank"' not in tag:
            continue
        rel = re.search(r'rel="([^"]*)"', tag)
        if not {"noopener", "noreferrer"} <= set(rel.group(1).split() if rel else []):
            print("MISSING:", path, " ".join(tag.split())[:120])
PY
```

Some cited outlets sit behind bot protection and will return 403 or 405 to
`curl` while working perfectly in a browser — Housing Today is one. Check those
in a browser before assuming a link is dead.

## Deployment

Netlify, configured in `netlify.toml`: build command `npm run build`, publish
directory `dist`.

The same file sets the security headers, including a Content-Security-Policy
that allowlists only Google Tag Manager and Simple Analytics. **If you add any
third-party script, embed or remote image, the CSP must be updated or the
browser will silently block it.** The Google Analytics config deliberately
lives in `src/static/assets/analytics.js` rather than inline so that
`script-src` does not need `'unsafe-inline'`.

## Images

Four photo slots currently hold labelled SVG placeholders. See
[IMAGES.md](IMAGES.md) for the paths, sizes and how to swap one in.
