export type TocItem = { id: string; label: string; depth: number; eyebrow?: string };

export type Block =
  | { type: "html"; html: string }
  | { type: "code"; lang: string; code: string; html: string; output?: string }
  | { type: "agent-loop" }
  | { type: "token-filter" };

export type Post = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  readingMinutes: number;
  toc: TocItem[];
  blocks: Block[];
};
