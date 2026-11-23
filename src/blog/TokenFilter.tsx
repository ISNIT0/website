import { useState } from "react";

// The example from the article: what comes after `"name":`? Probabilities are
// illustrative, like everything else here.
const CANDIDATES = [
  { token: "J", p: 0.31, valid: false },
  { token: "F", p: 0.22, valid: false },
  { token: '"', p: 0.18, valid: true },
  { token: "4", p: 0.07, valid: true },
  { token: "t", p: 0.05, valid: true },
];

export function TokenFilter() {
  const [jsonMode, setJsonMode] = useState(true);
  const chosen = CANDIDATES.find((c) => !jsonMode || c.valid)!;

  return (
    <figure className="widget">
      <div className="widget-head">
        <span className="post-eyebrow-sm">Try it · picking the next token</span>
        <div role="radiogroup" aria-label="Sampling mode" className="segmented">
          {[
            [false, "Plain"],
            [true, "JSON mode"],
          ].map(([value, label]) => (
            <button
              key={String(value)}
              type="button"
              role="radio"
              aria-checked={jsonMode === value}
              onClick={() => setJsonMode(value as boolean)}
            >
              {label as string}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="post-eyebrow-sm mb-3 text-gray-400">Text so far</p>
          <pre className="widget-mono">
            {"{\n  \"name\": "}
            <span key={chosen.token + jsonMode} className={`picked ${chosen.valid ? "" : "picked-bad"}`}>
              {chosen.token}
            </span>
          </pre>
          <p className={`mt-4 text-base ${chosen.valid ? "text-black" : "text-[#b3261e]"}`}>
            {chosen.valid
              ? "Still valid JSON: a string is opening."
              : "Broken: a bare J can never become valid JSON."}
          </p>
        </div>

        <div>
          <p className="post-eyebrow-sm mb-3 text-gray-400">Model’s ranked guesses</p>
          <ol className="space-y-2">
            {CANDIDATES.map((c) => {
              const blocked = jsonMode && !c.valid;
              const isChosen = c === chosen;
              return (
                <li key={c.token} className={`token-row ${blocked ? "is-blocked" : ""} ${isChosen ? "is-chosen" : ""}`}>
                  <code className="token-chip">{c.token}</code>
                  <span className="token-bar">
                    <span style={{ width: `${(c.p / 0.31) * 100}%` }} />
                  </span>
                  <span className="token-p">{Math.round(c.p * 100)}%</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </figure>
  );
}
