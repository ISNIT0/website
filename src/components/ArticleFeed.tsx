"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  articles,
  formatDate,
  tabs,
  type TabId,
} from "@/lib/articles";

export function ArticleFeed() {
  const [tab, setTab] = useState<TabId>("all");
  const selectedRef = useRef<HTMLButtonElement>(null);
  const current = tabs.find((item) => item.id === tab);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [tab]);

  const visible = useMemo(() => {
    if (tab === "all") return articles;
    return articles.filter((article) => article.projects.includes(tab));
  }, [tab]);

  return (
    <section className="mt-16 sm:mt-20">
      <div className="relative border-b border-gray-200">
        <div
          role="tablist"
          aria-label="Projects"
          className="-mb-px flex gap-x-5 overflow-x-auto overscroll-x-contain pr-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-x-6 sm:pr-0"
        >
          {tabs.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`tab-${item.id}`}
                ref={selected ? selectedRef : undefined}
                onClick={() => setTab(item.id)}
                className={`eyebrow shrink-0 pb-3 whitespace-nowrap transition-colors ${
                  selected
                    ? "text-black shadow-[inset_0_-1px_0_0_#000]"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white sm:hidden"
        />
      </div>

      {current?.blurb ? (
        <p className="max-w-xl py-6 text-lg leading-relaxed text-gray-700">
          {current.blurb}
        </p>
      ) : null}

      <ul className="divide-y divide-gray-200 border-b border-gray-200">
        {visible.map((article) => (
          <li key={article.url}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 py-5 sm:gap-5"
            >
              <img
                src={article.logo}
                alt=""
                width={28}
                height={28}
                className="mt-0.5 h-7 w-7 shrink-0 object-contain"
              />
              <span className="min-w-0 flex-1">
                <span className="eyebrow block text-gray-400">
                  {article.outlet}
                  <span className="mx-2 text-gray-300" aria-hidden="true">
                    ·
                  </span>
                  {formatDate(article.date)}
                </span>
                <span className="mt-2 block text-lg leading-snug text-black group-hover:underline">
                  {article.title}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
