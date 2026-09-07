import { readFile, writeFile, mkdir, rm, cp, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, "src");
const outDir = join(root, "dist");

const SITE_ORIGIN = "https://simmsreeve.com";

const pages = [
  { source: "index.html", out: "index.html", route: "/", priority: "1.0" },
  {
    source: "publications.html",
    out: "publications/index.html",
    route: "/publications/",
    priority: "0.8",
  },
];

const INCLUDE_PATTERN = /^([ \t]*)<!--\s*include:\s*([^\s>]+?)\s*-->[ \t]*$/gm;
const VARS_PATTERN = /<!--\s*vars\s*\n([\s\S]*?)-->\s*/;
const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
const MAX_INCLUDE_DEPTH = 10;

function parseVars(html) {
  const match = html.match(VARS_PATTERN);
  if (!match) return { vars: {}, body: html };

  const vars = {};
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf(":");
    if (separator === -1) {
      throw new Error(`Malformed vars line (expected "key: value"): ${trimmed}`);
    }
    vars[trimmed.slice(0, separator).trim()] = trimmed
      .slice(separator + 1)
      .trim();
  }
  return { vars, body: html.replace(VARS_PATTERN, "") };
}

// Indentation of the include comment is re-applied to every line of the
// partial, so the built markup stays readable in "view source".
async function resolveIncludes(html, depth = 0) {
  if (depth > MAX_INCLUDE_DEPTH) {
    throw new Error("Include depth exceeded — check for a circular include.");
  }

  const includes = [...html.matchAll(INCLUDE_PATTERN)];
  if (includes.length === 0) return html;

  let result = "";
  let cursor = 0;
  for (const match of includes) {
    const [full, indent, relativePath] = match;
    const partialPath = resolve(srcDir, relativePath);
    if (!partialPath.startsWith(srcDir)) {
      throw new Error(`Include escapes src/: ${relativePath}`);
    }
    if (!existsSync(partialPath)) {
      throw new Error(`Missing partial: ${relativePath}`);
    }

    const partial = await readFile(partialPath, "utf8");
    const resolved = await resolveIncludes(partial.trimEnd(), depth + 1);
    const indented = resolved
      .split("\n")
      .map((line) => (line.length > 0 ? indent + line : line))
      .join("\n");

    result += html.slice(cursor, match.index) + indented;
    cursor = match.index + full.length;
  }
  return result + html.slice(cursor);
}

function substitute(html, vars, source) {
  const missing = new Set();
  const output = html.replace(PLACEHOLDER_PATTERN, (_, key) => {
    if (!(key in vars)) {
      missing.add(key);
      return "";
    }
    return vars[key];
  });

  if (missing.size > 0) {
    throw new Error(
      `${source} is missing vars: ${[...missing].sort().join(", ")}`,
    );
  }
  return output;
}

function buildSitemap(lastModified) {
  const urls = pages
    .map(
      ({ route, priority }) =>
        `  <url>\n    <loc>${SITE_ORIGIN}${route}</loc>\n    <lastmod>${lastModified}</lastmod>\n    <priority>${priority}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  await rm(outDir, { recursive: true, force: true });
  if (process.argv.includes("--clean-only")) {
    console.log("Cleaned dist/");
    return;
  }
  await mkdir(outDir, { recursive: true });

  const staticDir = join(srcDir, "static");
  if (existsSync(staticDir)) {
    for (const entry of await readdir(staticDir)) {
      await cp(join(staticDir, entry), join(outDir, entry), {
        recursive: true,
      });
    }
  }

  for (const page of pages) {
    const raw = await readFile(join(srcDir, page.source), "utf8");
    const { vars, body } = parseVars(raw);
    vars.canonical = `${SITE_ORIGIN}${page.route}`;
    vars.origin = SITE_ORIGIN;
    vars.year = String(new Date().getFullYear());

    const resolved = await resolveIncludes(body);
    const html = substitute(resolved, vars, page.source);

    const destination = join(outDir, page.out);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html.trimStart());
    console.log(`built ${page.out}`);
  }

  const lastModified = new Date().toISOString().slice(0, 10);
  await writeFile(join(outDir, "sitemap.xml"), buildSitemap(lastModified));
  console.log("built sitemap.xml");
}

main().catch((error) => {
  console.error(`Build failed: ${error.message}`);
  process.exit(1);
});
