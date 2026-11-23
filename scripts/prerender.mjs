// Renders the app to static HTML after `vite build`, so crawlers and first paint
// get the full page (as the old Next.js static export did). Output: out/index.html.
import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../out/", import.meta.url));
const ssr = fileURLToPath(new URL("../out-ssr/", import.meta.url));

const { render, renderNotFound } = await import(new URL("entry-server.js", `file://${ssr}`).href);

// Preload the latin-subset faces the first screen uses, like next/font did.
const fonts = readdirSync(`${out}assets`)
  .filter((f) => /^inria-serif-(300|400)-normal-latin-(?!ext-)[^.]+\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join("\n    ");

const shell = readFileSync(`${out}index.html`, "utf8").replace("<!--preload-fonts-->", fonts);
writeFileSync(`${out}index.html`, shell.replace("<!--app-html-->", render()));

const notFound = shell
  .replace(/<title>[^<]*<\/title>/, "<title>404: This page could not be found.</title>")
  .replace(/\s*<script type="module"[^>]*><\/script>/, "")
  .replace("<!--app-html-->", renderNotFound());
writeFileSync(`${out}404.html`, notFound);
rmSync(ssr, { recursive: true, force: true });
console.log("prerendered out/index.html and out/404.html");
