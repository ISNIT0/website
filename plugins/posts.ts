// Vite plugin: `import post from "./posts/x.md"` yields a parsed Post, with code
// highlighted at build time by Shiki, so no highlighter ships to the browser.
import { Marked, type Token, type Tokens } from "marked";
import path from "node:path";
import { createHighlighter, type Highlighter } from "shiki";
import type { Plugin } from "vite";
import { externalRel, isInternal } from "../src/lib/links";
import type { Block, Post, TocItem } from "../src/blog/types";

const THEME = "vitesse-light";
const LANGS = ["ts", "typescript", "text"];
const LANG_LABEL: Record<string, string> = { ts: "TypeScript", typescript: "TypeScript", text: "Text" };

let highlighter: Promise<Highlighter> | undefined;
const getHighlighter = () =>
  (highlighter ??= createHighlighter({ themes: [THEME], langs: LANGS.filter((l) => l !== "text") }));

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Heading labels go to React as plain text, so turn marked's entities back into characters.
function decodeEntities(text: string) {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return named[e.toLowerCase()] ?? m;
  });
}

function parseFrontmatter(src: string) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(src);
  if (!match) throw new Error("post is missing frontmatter");
  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: src.slice(match[0].length) };
}

// Trailing `// ...` lines at the end of a TypeScript snippet are the example's
// output: split them off so they render (and replay) as output, not as code.
function splitOutput(code: string, lang: string) {
  if (lang !== "ts" && lang !== "typescript") return { code, output: undefined };
  const lines = code.replace(/\n+$/, "").split("\n");
  let i = lines.length;
  while (i > 0 && /^\s*\/\/ ?/.test(lines[i - 1])) i--;
  if (i === lines.length || i === 0) return { code, output: undefined };
  return {
    code: lines.slice(0, i).join("\n"),
    output: lines
      .slice(i)
      .map((l) => l.replace(/^\s*\/\/ ?/, ""))
      .join("\n"),
  };
}

export async function parsePost(src: string, slug: string): Promise<Post> {
  const { data, body } = parseFrontmatter(src);
  const hl = await getHighlighter();
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  const marked = new Marked({
    gfm: true,
    renderer: {
      // Same rule as the homepage: other people's sites are nofollow, new tab.
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const t = title ? ` title="${title}"` : "";
        if (isInternal(href) || href.startsWith("#")) return `<a href="${href}"${t}>${inner}</a>`;
        return `<a href="${href}"${t} target="_blank" rel="${externalRel(href)}">${inner}</a>`;
      },
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        let id = slugify(inner);
        while (usedIds.has(id)) id += "-";
        usedIds.add(id);
        const part = depth === 2 ? /^(Part [A-Za-z]+):\s*(.*)$/.exec(inner) : null;
        const label = decodeEntities((part ? part[2] : inner).replace(/<[^>]+>/g, ""));
        if (depth === 2 || depth === 3) toc.push({ id, label, depth, eyebrow: part?.[1] });
        if (part) {
          return `<h2 id="${id}"><span class="post-eyebrow">${part[1]}</span>${part[2]}</h2>\n`;
        }
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
    },
  });

  const tokens = marked.lexer(body);
  const blocks: Block[] = [];
  let prose: Token[] = [];
  const flush = () => {
    if (!prose.length) return;
    const html = marked
      .parser(Object.assign(prose, { links: tokens.links }))
      // Wrap tables so they can scroll sideways on phones.
      .replace(/<table>/g, '<div class="post-table"><table>')
      .replace(/<\/table>/g, "</table></div>");
    blocks.push({ type: "html", html });
    prose = [];
  };

  for (const token of tokens) {
    if (token.type === "code") {
      flush();
      const t = token as Tokens.Code;
      const lang = t.lang || "text";
      const { code, output } = splitOutput(t.text, lang);
      const html = hl.codeToHtml(code, { lang, theme: THEME });
      blocks.push({ type: "code", lang: LANG_LABEL[lang] ?? lang, code, html, output });
      continue;
    }
    if (token.type === "paragraph") {
      const directive = /^::([a-z-]+)$/.exec((token as Tokens.Paragraph).text.trim());
      if (directive) {
        flush();
        if (directive[1] !== "agent-loop" && directive[1] !== "token-filter") {
          throw new Error(`unknown directive ::${directive[1]}`);
        }
        blocks.push({ type: directive[1] });
        continue;
      }
    }
    prose.push(token);
  }
  flush();

  const words = body.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: data.title,
    dek: data.dek,
    date: data.date,
    readingMinutes: Math.max(1, Math.round(words / 230)),
    toc,
    blocks,
  };
}

export function postsPlugin(): Plugin {
  return {
    name: "posts",
    async transform(src, id) {
      if (!id.endsWith(".md")) return;
      const post = await parsePost(src, path.basename(id, ".md"));
      return { code: `export default ${JSON.stringify(post)};`, map: null };
    },
  };
}
