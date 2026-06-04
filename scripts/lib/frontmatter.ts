import matter from "gray-matter";
import path from "node:path";
import { slugify } from "./slugify";

export type ParsedNote = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  date: string; // yyyy-mm-dd
  featured: boolean;
  order: number | null;
  sourcePath: string;
  body: string;
};

export function isPublished(raw: string): boolean {
  try {
    return matter(raw).data?.publish === true;
  } catch {
    return false;
  }
}

function toIsoDate(value: unknown, mtimeMs: number): string {
  const d = value ? new Date(value as string) : new Date(mtimeMs);
  if (Number.isNaN(d.getTime()))
    return new Date(mtimeMs).toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function firstParagraph(body: string): string {
  const trimmed = body.trim();
  const para = trimmed.split(/\n\s*\n/)[0] ?? "";
  return para.replace(/\s+/g, " ").trim().slice(0, 200);
}

export function parseNote(
  raw: string,
  sourcePath: string,
  mtimeMs: number
): ParsedNote {
  const { data, content } = matter(raw);
  const fileTitle = path.basename(sourcePath).replace(/\.md$/i, "");
  const title = (data.title as string)?.trim() || fileTitle;
  const summary =
    (data.summary as string)?.trim() ||
    (data.description as string)?.trim() ||
    firstParagraph(content);
  const tags = Array.isArray(data.tags)
    ? data.tags.map((t) => String(t).trim()).filter(Boolean)
    : typeof data.tags === "string"
      ? [data.tags]
      : [];
  return {
    title,
    slug: slugify(title),
    summary,
    tags,
    date: toIsoDate(data.date ?? data.created, mtimeMs),
    featured: data.featured === true,
    order: typeof data.order === "number" ? data.order : null,
    sourcePath,
    body: content.trim(),
  };
}
