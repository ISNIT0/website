import agents from "@/content/posts/agents-are-just-string-concatenation.md";
import type { Post } from "./types";

export const posts: Post[] = [agents];

export const postPath = (slug: string) => `/blog/${slug}/`;
