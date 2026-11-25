import agents from "@/content/posts/agents-are-just-string-concatenation.md";
import spelling from "@/content/posts/spelling-mistakes.md";
import type { Post } from "./types";

export const posts: Post[] = [spelling, agents];

export const postPath = (slug: string) => `/blog/${slug}/`;
