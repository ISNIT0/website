# Images

Four image slots on the site currently hold placeholders. Each is a 3:2 SVG
that renders as a light grey box with a label, so the layout is already correct
and nothing shifts when a real photograph goes in.

## Slots to fill

| Slot                    | Placeholder                      | Referenced in                        | Caption on the page                            |
| ----------------------- | -------------------------------- | ------------------------------------ | ---------------------------------------------- |
| Forest City render      | `src/static/img/forest-city-render.svg` | `src/index.html` — Forest City  | Forest City — render                           |
| The O2 launch           | `src/static/img/o2-launch.svg`   | `src/index.html` — Forest City        | The launch — indigo at The O2, 23 October 2025 |
| Tube clean-up           | `src/static/img/tube-cleanup.svg`| `src/index.html` — Looking for Growth | Bakerloo line clean-up, June 2025              |
| Future House interior   | `src/static/img/future-house.svg`| `src/index.html` — Earlier            | Future House — Hackney                         |

**Recommended source size:** 1800 × 1200 or larger, 3:2 landscape. The images
are displayed at a maximum of 768px wide, so 1800px covers 2x retina with room
to spare.

**Format:** WebP is preferred (`cwebp -q 82 photo.jpg -o photo.webp`), JPEG is
fine. Aim to keep each file under about 200 KB.

## How to swap one in

Two steps, because the placeholder is an SVG and your photograph will not be:

1. Drop the file into `src/static/img/`, keeping the same base name — for
   example `o2-launch.webp`.
2. Update the one `src` attribute in `src/index.html`, and delete the
   placeholder:

```html
<!-- before -->
<img src="/img/o2-launch.svg" ... />
<!-- after -->
<img src="/img/o2-launch.webp" ... />
```

The `alt` text and `width`/`height` attributes are already set correctly, so
leave them alone unless the aspect ratio differs from 3:2. If it does, change
`aspect-3/2` on that `<img>` to match — for example `aspect-4/3`.

Then run `npm run build`.

## Rights

Press photographs belong to the outlet or the photographer, so they cannot be
copied from an article. These four slots need images you own or have permission
to use.

## Assets that are already real

| File                            | Notes                                                          |
| ------------------------------- | -------------------------------------------------------------- |
| `src/static/img/joe-reeve.webp` | Watercolour portrait from forestcity.uk (`/img/joe.png`), self-hosted. Rendered at 144px tall against the image's own black ground. |
| `src/static/favicon.svg`        | Black square, white serif "JR".                                |
| `src/static/apple-touch-icon.png` | 180 × 180, generated from `tools/icon.html`.                  |
| `src/static/og.png`             | 1200 × 630 social card, generated from `tools/og-image.html`.   |

## Regenerating the social card and touch icon

Both are rendered from local HTML with headless Chrome, so the typography
matches the site exactly. From the repository root on macOS:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" --headless --disable-gpu --hide-scrollbars \
  --allow-file-access-from-files --force-device-scale-factor=1 \
  --screenshot=src/static/og.png --window-size=1200,630 \
  "file://$PWD/tools/og-image.html"

"$CHROME" --headless --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 \
  --screenshot=src/static/apple-touch-icon.png --window-size=180,180 \
  "file://$PWD/tools/icon.html"
```

Edit the copy in `tools/og-image.html` first if the headline has changed. Keep
it in sync with the `og:image:alt` text in `src/partials/head.html`.
