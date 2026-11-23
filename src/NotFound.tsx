export function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 sm:py-24">
      <h1>
        <span className="block text-4xl font-light tracking-tight sm:text-5xl">404</span>
        <span className="mt-3 block text-xl font-light text-gray-600 sm:text-2xl">
          This page could not be found.
        </span>
      </h1>
      <p className="mt-8">
        <a
          href="/"
          className="eyebrow inline-block border-b border-black pb-1 text-black transition-opacity hover:opacity-55"
        >
          Back to Joe Reeve
        </a>
      </p>
    </main>
  );
}
