import { StrictMode, type ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";

const root = document.getElementById("root")!;

async function page(): Promise<ReactNode> {
  // Blog code (and post content) loads only on blog pages.
  if (location.pathname.startsWith("/blog/")) {
    const [{ PostPage }, { postFor }] = await Promise.all([import("./blog/PostPage"), import("./routes")]);
    const post = postFor(location.pathname);
    if (post) return <PostPage post={post} />;
  }
  const { App } = await import("./App");
  return <App />;
}

const app = <StrictMode>{await page()}</StrictMode>;

// Production HTML is prerendered (scripts/prerender.mjs); dev serves an empty shell.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
