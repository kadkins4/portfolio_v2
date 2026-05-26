export type WorkItem = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  image: string | null;
  imageFocus: string;
  blurDataURL?: string;
  externalUrl: string | null;
};

export type NoteItem = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  date: string | null;
  image: string | null;
  blurDataURL?: string;
};

// Flattened item for the unified /studio masonry feed.
export type StudioItem = {
  kind: "project" | "note";
  slug: string;
  href: string; // /projects/<slug> or /notes/<slug>
  title: string;
  description: string; // project description OR note summary
  tags: string[];
  date: string | null;
  image: string | null;
  imageFocus: string;
  blurDataURL?: string;
  externalUrl: string | null; // projects only; null for notes
  featured: boolean; // projects only; false for notes
  order: number | null; // ordering among featured items; null = date-based
};
