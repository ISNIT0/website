import { useEffect, useRef, useState } from "react";

type NodeId = "user" | "concat" | "model" | "decision" | "tool" | "append" | "reply";

const NODES: { id: NodeId; n?: string; title: string; detail: string }[] = [
  { id: "user", n: "1", title: "User message", detail: "Appended to the history" },
  { id: "concat", n: "2", title: "Concatenate", detail: "Everything, as one string" },
  { id: "model", n: "3", title: "Call the model", detail: "It predicts what comes next" },
  { id: "decision", title: "Function call?", detail: "Yes: run it. No: done" },
  { id: "tool", n: "4", title: "Run the tool", detail: "Plain code, no AI" },
  { id: "append", n: "5", title: "Append the output", detail: "Then loop back to 2" },
  { id: "reply", title: "Reply to the user", detail: "Plain text ends the loop" },
];

type Segment = { text: string; kind: "system" | "user" | "model" | "tool" };

const START: Segment[] = [
  {
    kind: "system",
    text: "AVAILABLE FUNCTIONS:\n# get_weather(city)\n\n<__SYSTEM__>: You are a helpful agent.\n",
  },
];

const FRAMES: { node: NodeId; note: string; add?: Segment; branch?: "yes" | "no"; call?: boolean }[] = [
  {
    node: "user",
    note: "The user asks a question. It’s appended to the history.",
    add: { kind: "user", text: "<__USER__>: What's the weather like?\n" },
  },
  { node: "concat", note: "The harness glues everything into one string. That string is the model’s entire world." },
  {
    node: "model",
    call: true,
    note: "The model predicts what comes next. This time, a function call.",
    add: {
      kind: "model",
      text: '<__FUNCTION_CALL__>: { "name": "get_weather", "arguments": { "city": "London" } }\n',
    },
  },
  { node: "decision", branch: "yes", note: "It’s a function call, so the loop carries on." },
  { node: "tool", note: "The harness runs get_weather(\"London\"). Ordinary code, no AI involved." },
  {
    node: "append",
    note: "The result is concatenated on the end. Back round the loop.",
    add: { kind: "tool", text: '<__FUNCTION_CALL_OUTPUT__>: { "temperatureDeg": 20, "cloud": 0.4 }\n' },
  },
  { node: "concat", note: "Same string as before, just longer." },
  {
    node: "model",
    call: true,
    note: "With the weather in the string, the model writes a plain-text reply.",
    add: { kind: "model", text: "<__AGENT__>: It's 20 degrees and slightly cloudy in London.\n" },
  },
  { node: "decision", branch: "no", note: "Plain text, not a function call, so the loop stops." },
  { node: "reply", note: "The reply goes back to the user. Every step was string concatenation." },
];

export function AgentLoop() {
  const [frame, setFrame] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const stringRef = useRef<HTMLPreElement>(null);

  const done = frame >= FRAMES.length - 1;
  // Playback stops by itself at the last frame.
  const isPlaying = playing && !done;
  const current = frame >= 0 ? FRAMES[frame] : undefined;
  const segments = [
    ...START,
    ...FRAMES.slice(0, frame + 1).flatMap((f) => (f.add ? [f.add] : [])),
  ];
  const latest = current?.add ? segments.length - 1 : -1;
  const chars = segments.reduce((n, s) => n + s.text.length, 0);
  const calls = FRAMES.slice(0, frame + 1).filter((f) => f.call).length;
  const visited = new Set(FRAMES.slice(0, frame + 1).map((f) => f.node));

  useEffect(() => {
    if (!isPlaying) return;
    timer.current = window.setTimeout(() => setFrame((f) => f + 1), frame < 0 ? 200 : 1700);
    return () => window.clearTimeout(timer.current);
  }, [isPlaying, frame]);

  useEffect(() => {
    const el = stringRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [frame]);

  const step = () => {
    setPlaying(false);
    setFrame((f) => Math.min(f + 1, FRAMES.length - 1));
  };
  const reset = () => {
    setPlaying(false);
    setFrame(-1);
  };
  const togglePlay = () => {
    if (done) {
      setFrame(-1);
      setPlaying(true);
    } else setPlaying(!isPlaying);
  };

  const nodeClass = (id: NodeId) =>
    `loop-node ${current?.node === id ? "is-active" : visited.has(id) ? "is-visited" : ""}`;

  const renderNode = (id: NodeId) => {
    const node = NODES.find((x) => x.id === id)!;
    const isDecision = id === "decision";
    return (
      <div className={nodeClass(id)} data-node={id}>
        <span className={isDecision ? "loop-diamond" : "loop-num"} aria-hidden="true">
          {isDecision ? "" : (node.n ?? "✓")}
        </span>
        <span className="min-w-0">
          <span className="block leading-tight">{node.title}</span>
          <span className="block truncate text-[0.8rem] leading-snug text-gray-500">{node.detail}</span>
        </span>
        {isDecision && current?.node === "decision" ? (
          <span className="loop-branch">{current.branch === "yes" ? "Yes ↓" : "No ↓↓"}</span>
        ) : null}
      </div>
    );
  };

  return (
    <figure className="widget agent-loop">
      <div className="widget-head">
        <span className="post-eyebrow-sm">The agent loop · 5 steps, 1 decision</span>
        <div className="flex items-center gap-5">
          <button type="button" className="code-action" onClick={togglePlay}>
            {isPlaying ? "Pause" : done ? "Replay" : "Play"}
          </button>
          <button type="button" className="code-action" onClick={step} disabled={done}>
            Step →
          </button>
          <button type="button" className="code-action" onClick={reset} disabled={frame < 0}>
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-10">
        <div>
          {renderNode("user")}
          <div className="loop-group">
            {renderNode("concat")}
            {renderNode("model")}
            {renderNode("decision")}
            {renderNode("tool")}
            {renderNode("append")}
            <span className={`loop-return ${current?.node === "append" ? "is-active" : ""}`} aria-hidden="true" />
          </div>
          {renderNode("reply")}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <span className="post-eyebrow-sm text-gray-400">The string</span>
            <span className="post-eyebrow-sm tabular-nums text-gray-400">
              {chars.toLocaleString("en-GB")} chars · {calls} model {calls === 1 ? "call" : "calls"}
            </span>
          </div>
          <pre ref={stringRef} className="loop-string">
            {segments.map((s, i) => (
              <span key={i} className={`seg seg-${s.kind} ${i === latest ? "is-new" : ""}`}>
                {s.text}
              </span>
            ))}
          </pre>
          <p className="loop-note" aria-live="polite">
            {current ? current.note : "Press Play, or Step through one turn of an agent answering a question."}
          </p>
        </div>
      </div>
    </figure>
  );
}
