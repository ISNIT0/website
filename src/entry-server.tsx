import { StrictMode } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { App } from "./App";
import { PostPage } from "./blog/PostPage";
import { NotFound } from "./NotFound";
import { postFor, postHead } from "./routes";

export { ogCards, routes } from "./routes";

/** HTML for a route, plus head tags to swap in (none for the homepage). */
export function render(path: string): { html: string; head?: string } {
  const post = postFor(path);
  const page = post ? <PostPage post={post} /> : <App />;
  return {
    html: renderToString(<StrictMode>{page}</StrictMode>),
    head: post ? postHead(post) : undefined,
  };
}

// Static only: the 404 page ships no JavaScript.
export function renderNotFound() {
  return renderToStaticMarkup(<NotFound />);
}
