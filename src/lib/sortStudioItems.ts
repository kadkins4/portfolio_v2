import type { StudioItem } from "@/types";

/**
 * Orders the unified studio feed: featured items first (by their `order`,
 * lowest first), then everything else by date published, newest first.
 * Undated items sort last. `order` only applies among featured items — a
 * non-featured item's `order` never floats it above a featured one.
 *
 * Returns a new array; does not mutate the input.
 */
export function sortStudioItems(items: StudioItem[]): StudioItem[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;

    if (a.featured && b.featured) {
      const oa = a.order ?? Number.POSITIVE_INFINITY;
      const ob = b.order ?? Number.POSITIVE_INFINITY;
      if (oa !== ob) return oa - ob;
    }

    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });
}
