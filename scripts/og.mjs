// Social share cards (1200×630 PNG) in the site's own type: Inria Serif on white, with
// the watercolour portrait on the right. Used by prerender.mjs; fonts are OFL (scripts/og/OFL.txt).
import { readFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const asset = (name) => readFileSync(new URL(`og/${name}`, import.meta.url));

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const fonts = [
  { name: "Inria Serif", data: asset("InriaSerif-Light.ttf"), weight: 300, style: "normal" },
  { name: "Inria Serif", data: asset("InriaSerif-Regular.ttf"), weight: 400, style: "normal" },
];
const portrait = `data:image/png;base64,${asset("joe-reeve.png").toString("base64")}`;

const el = (type, style, children) => ({ type, props: { style, children } });

const eyebrow = (text, color) =>
  el("div", { fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase", color }, text);

/** Title sizes down as it gets longer so it never runs into the portrait. */
const titleSize = (title, big) =>
  big ? 104 : title.length > 60 ? 54 : title.length > 36 ? 64 : 76;

/**
 * @param {{ eyebrow: string; title: string; dek?: string; big?: boolean; footer?: string }} card
 * @returns {Promise<Buffer>} PNG
 */
export async function renderCard({ eyebrow: top, title, dek, big = false, footer = "Joe Reeve · simmsreeve.com" }) {
  const tree = el(
    "div",
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: "flex",
      position: "relative",
      background: "#ffffff",
      fontFamily: "Inria Serif",
      fontWeight: 300,
      color: "#000000",
    },
    [
      {
        type: "img",
        props: {
          src: portrait,
          width: 456,
          height: 536,
          style: { position: "absolute", right: 24, bottom: 0 },
        },
      },
      el(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 780,
          height: "100%",
          padding: "72px 0 64px 80px",
        },
        [
          el("div", { display: "flex", flexDirection: "column" }, [
            eyebrow(top, "#9ca3af"),
            el(
              "div",
              {
                marginTop: 28,
                fontSize: titleSize(title, big),
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
              },
              title,
            ),
            dek
              ? el("div", { marginTop: 26, fontSize: 30, lineHeight: 1.35, color: "#4b5563", whiteSpace: "pre-line" }, dek)
              : null,
          ].filter(Boolean)),
          el("div", { display: "flex", alignItems: "center" }, [
            el(
              "div",
              { display: "flex", paddingBottom: 6, borderBottom: "1.5px solid #000000" },
              [eyebrow(footer, "#000000")],
            ),
          ]),
        ],
      ),
    ],
  );

  const svg = await satori(tree, { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}
