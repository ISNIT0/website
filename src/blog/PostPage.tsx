import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/articles";
import { AgentLoop } from "./AgentLoop";
import { CodeBlock } from "./CodeBlock";
import { TokenFilter } from "./TokenFilter";
import type { Block, Post, TocItem } from "./types";

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "html":
      return <div dangerouslySetInnerHTML={{ __html: block.html }} />;
    case "code":
      return <CodeBlock {...block} />;
    case "agent-loop":
      return <AgentLoop />;
    case "token-filter":
      return <TokenFilter />;
  }
}

function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const article = document.getElementById("post-body");
      if (!article || !bar.current) return;
      const { top, height } = article.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -top / (height - window.innerHeight)));
      bar.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div ref={bar} className="reading-progress" aria-hidden="true" />;
}

function useActiveHeading(items: TocItem[]) {
  const [active, setActive] = useState<string>();
  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    let frame = 0;
    const update = () => {
      frame = 0;
      // The last heading that has scrolled past the top third of the screen.
      const line = window.innerHeight * 0.3;
      let current: string | undefined;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);
  return active;
}

function TableOfContents({ toc }: { toc: TocItem[] }) {
  const active = useActiveHeading(toc);
  // Each entry's part (its nearest h2), so sub-sections show only for the part you're reading.
  const partOf = toc.map((_, i) => toc.slice(0, i + 1).findLast((t) => t.depth === 2)?.id);
  const activePart = partOf[toc.findIndex((t) => t.id === active)];

  return (
    <nav aria-label="Contents" className="post-toc">
      <p className="post-eyebrow-sm mb-5 text-gray-400">Contents</p>
      <ol>
        {toc.map((item, i) => {
          if (item.depth === 3 && partOf[i] !== activePart) return null;
          return (
            <li key={item.id} className={item.depth === 3 ? "toc-sub" : "toc-part"}>
              <a href={`#${item.id}`} className={active === item.id ? "is-active" : undefined}>
                {item.eyebrow ? <span className="toc-eyebrow">{item.eyebrow}</span> : null}
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PostPage({ post }: { post: Post }) {
  return (
    <>
      <ReadingProgress />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8">
        <a href="/" className="post-home eyebrow">
          <img src="/joe-reeve.webp" alt="" width={176} height={207} className="h-8 w-auto" />
          Joe Reeve
        </a>
        <a href="/" className="eyebrow text-gray-400 transition-colors hover:text-black">
          All writing
        </a>
      </header>

      <main className="post-layout">
        <header className="post-hero">
          <p className="eyebrow text-gray-400">
            Essay
            <span className="mx-2 text-gray-300" aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="mx-2 text-gray-300" aria-hidden="true">·</span>
            {post.readingMinutes} min read
          </p>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-dek">{post.dek}</p>
          <div className="post-rule" aria-hidden="true" />
        </header>

        <aside className="post-aside">
          <TableOfContents toc={post.toc} />
        </aside>

        <article id="post-body" className="post-body">
          {post.blocks.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </article>

        <footer className="post-footer">
          <img src="/joe-reeve.webp" alt="Joe Reeve" width={176} height={207} className="h-16 w-auto" />
          <div>
            <p className="text-xl font-light">Joe Reeve</p>
            <p className="mt-1 text-gray-600">Technologist &amp; Proactivist. Formerly of ElevenLabs &amp; Amplitude.</p>
            <a
              href="/"
              className="eyebrow mt-5 inline-block border-b border-black pb-1 text-black transition-opacity hover:opacity-55"
            >
              More from Joe
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
