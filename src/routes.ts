import { postPath, posts } from "./blog/posts";
import type { Post } from "./blog/types";
import { formatDate } from "./lib/articles";

const SITE = "https://simmsreeve.com";

/** Share cards for prerender.mjs to draw: written to out/og/<name>.png. */
export const ogCards = [
  {
    name: "home",
    eyebrow: "Technology, Politics, Optimism",
    title: "Joe Reeve",
    dek: "Technologist & Proactivist\nFormerly of ElevenLabs & Amplitude",
    big: true,
    footer: "simmsreeve.com",
  },
  ...posts.map((p) => ({ name: p.slug, eyebrow: `Essay · ${formatDate(p.date)}`, title: p.title, dek: p.dek })),
];

export const routes = ["/", ...posts.map((p) => postPath(p.slug))];

export function postFor(path: string): Post | undefined {
  const normalised = path.endsWith("/") ? path : `${path}/`;
  return posts.find((p) => postPath(p.slug) === normalised);
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Head tags for a post page. The homepage keeps the ones in index.html. */
export function postHead(post: Post) {
  const url = `${SITE}${postPath(post.slug)}`;
  const title = `${post.title} · Joe Reeve`;
  const image = `${SITE}/og/${post.slug}.png`;
  const imageAlt = `${post.title}: ${post.dek}`;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(post.dek)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${esc(post.title)}" />`,
    `<meta property="og:description" content="${esc(post.dek)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="Joe Reeve" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}" />`,
    `<meta property="article:published_time" content="${post.date}" />`,
    `<meta property="article:author" content="${SITE}/" />`,
    `<meta name="author" content="Joe Reeve" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(post.title)}" />`,
    `<meta name="twitter:description" content="${esc(post.dek)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${esc(imageAlt)}" />`,
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.dek,
      datePublished: post.date,
      image: image,
      author: { "@type": "Person", name: "Joe Reeve", url: `${SITE}/` },
      mainEntityOfPage: url,
      url,
    }).replace(/</g, "\\u003c")}</script>`,
  ].join("\n    ");
}
