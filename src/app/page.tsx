import { ArticleFeed } from "@/components/ArticleFeed";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 sm:py-24">
      <img
        src="/joe-reeve.webp"
        alt="Joe Reeve"
        width={176}
        height={207}
        className="mb-10 h-36 w-auto"
      />

      <h1>
        <span className="block text-4xl font-light tracking-tight sm:text-5xl">
          Joe Reeve
        </span>
        <span className="mt-3 block text-xl font-light text-gray-600 sm:text-2xl">
          Proactivist &amp; Technologist
        </span>
      </h1>

      <p className="mt-8">
        <a
          href="https://luma.com/ldn"
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow inline-block border-b border-black pb-1 text-black transition-opacity hover:opacity-55"
        >
          Attend My Next Event
        </a>
      </p>

      <ArticleFeed />
    </main>
  );
}
