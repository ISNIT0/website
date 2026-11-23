import { postPath, posts } from "./blog/posts";
import type { Post } from "./blog/types";

const SITE = "https://simmsreeve.com";

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
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(post.dek)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${esc(post.title)}" />`,
    `<meta property="og:description" content="${esc(post.dek)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/joe-reeve.webp" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="article:published_time" content="${post.date}" />`,
    `<meta property="article:author" content="Joe Reeve" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(post.title)}" />`,
    `<meta name="twitter:description" content="${esc(post.dek)}" />`,
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.dek,
      datePublished: post.date,
      author: { "@type": "Person", name: "Joe Reeve", url: SITE },
      url,
    }).replace(/</g, "\\u003c")}</script>`,
  ].join("\n    ");
}
