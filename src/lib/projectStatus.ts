export type ProjectStatus = "live" | "in-progress";

/** Entries older than the status field predate it and read as "live". */
type HasStatus = { status?: string | null };

export function statusOf(entry: HasStatus): ProjectStatus {
  return entry.status === "in-progress" ? "in-progress" : "live";
}

/**
 * In-progress projects are unlisted, not unpublished: they drop out of the
 * projects index and the feed, but keep a working detail page so the neon
 * city's under-construction unit has somewhere to point.
 */
export function isListed(entry: HasStatus): boolean {
  return statusOf(entry) === "live";
}
