import { useEffect, useRef, useState } from "react";
import { glassCapture } from "@/lib/glass";

type Props = { lang: string; code: string; html: string; output?: string };

// Rough "tokens": words, runs of spaces, or single punctuation marks.
const tokenise = (text: string) => text.match(/\s+|[\p{L}\p{N}_'’]+|[^\s\p{L}\p{N}_]/gu) ?? [];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function CodeBlock({ lang, code, html, output }: Props) {
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState<string | undefined>(output);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    const text = output ? `${code}\n${output.replace(/^/gm, "// ")}` : code;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function run() {
    if (!output) return;
    glassCapture("code_example_run", { lang, path: location.pathname });
    window.clearTimeout(timer.current);
    if (prefersReducedMotion()) {
      setShown(output);
      return;
    }
    const tokens = tokenise(output);
    let i = 0;
    setRunning(true);
    setShown("");
    const tick = () => {
      i += 1;
      setShown(tokens.slice(0, i).join(""));
      if (i < tokens.length) timer.current = window.setTimeout(tick, 18 + Math.random() * 42);
      else setRunning(false);
    };
    timer.current = window.setTimeout(tick, 280);
  }

  return (
    <figure className="code-block">
      <div className="code-bar">
        <span className="post-eyebrow-sm">{lang}</span>
        <span className="flex items-center gap-4">
          {output ? (
            <button
              type="button"
              onClick={run}
              disabled={running}
              className="code-action"
              title="Replay the example's output"
            >
              <svg viewBox="0 0 10 10" aria-hidden="true" className="h-2 w-2 fill-current">
                <path d="M1 0.5v9l8-4.5z" />
              </svg>
              {running ? "Running" : "Run"}
            </button>
          ) : null}
          <button type="button" onClick={copy} className="code-action">
            {copied ? "Copied" : "Copy"}
          </button>
        </span>
      </div>
      <div className="code-body" dangerouslySetInnerHTML={{ __html: html }} />
      {output ? (
        <div className="code-output" aria-live="polite">
          <span className="post-eyebrow-sm code-output-label">Output</span>
          {/* The hidden copy holds the full height so replaying doesn't make the page jump. */}
          <div className="output-stack">
            <pre aria-hidden="true" className="invisible">
              {output}
            </pre>
            <pre>
              {shown}
              {running ? <span className="caret" aria-hidden="true" /> : null}
            </pre>
          </div>
        </div>
      ) : null}
    </figure>
  );
}
