// Renders every route to static HTML after `vite build`, so crawlers and first
// paint get the full page. Output: out/index.html, out/blog/<slug>/index.html, out/404.html.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../out/", import.meta.url));
const ssr = fileURLToPath(new URL("../out-ssr/", import.meta.url));

const { render, renderNotFound, routes } = await import(new URL("entry-server.js", `file://${ssr}`).href);

// Preload the latin-subset faces the first screen uses, like next/font did.
const fonts = readdirSync(`${out}assets`)
  .filter((f) => /^inria-serif-(300|400)-normal-latin-(?!ext-)[^.]+\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join("\n    ");

const shell = readFileSync(`${out}index.html`, "utf8").replace("<!--preload-fonts-->", fonts);
const HEAD = /<!--head:start-->[\s\S]*?<!--head:end-->/;
if (!HEAD.test(shell)) throw new Error("index.html is missing the head:start/head:end markers");

for (const route of routes) {
  const { html, head } = render(route);
  const page = shell
    .replace(HEAD, (block) => (head ?? block.replace(/<!--head:(start|end)-->\n?\s*/g, "")).trim())
    .replace("<!--app-html-->", html);
  const dir = `${out}${route.replace(/^\//, "")}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}index.html`, page);
  console.log(`prerendered ${route}`);
}

const notFound = shell
  .replace(HEAD, "<title>404: This page could not be found.</title>")
  .replace(/\s*<script type="module"[^>]*><\/script>/, "")
  .replace("<!--app-html-->", renderNotFound());
writeFileSync(`${out}404.html`, notFound);

rmSync(ssr, { recursive: true, force: true });
console.log("prerendered /404.html");
