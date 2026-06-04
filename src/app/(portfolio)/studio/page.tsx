import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import StudioGrid from "@/components/StudioGrid";
import { getBlurDataURL } from "@/lib/getBlurDataURL";
import { sortStudioItems } from "@/lib/sortStudioItems";
import type { StudioItem } from "@/types";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Projects and notes by Kendall Adkins — software engineering, developer tools, and things worth writing down.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "Studio — Kendall Adkins",
    description: "Projects and notes by Kendall Adkins.",
  },
};

export default async function StudioPage() {
  const reader = createReader(process.cwd(), config);
  const [projects, notes] = await Promise.all([
    reader.collections.projects.all(),
    reader.collections.notes.all(),
  ]);

  const projectItems: StudioItem[] = await Promise.all(
    projects.map(async (item) => ({
      kind: "project" as const,
      slug: item.slug,
      href: `/projects/${item.slug}`,
      title: item.entry.title,
      description: item.entry.description,
      tags: [...(item.entry.tags ?? [])],
      date: item.entry.date ?? null,
      image: item.entry.image ?? null,
      imageFocus: item.entry.imageFocus ?? "center",
      blurDataURL: item.entry.image
        ? await getBlurDataURL(item.entry.image)
        : undefined,
      externalUrl: item.entry.externalUrl ?? null,
      featured: item.entry.featured ?? false,
      order: item.entry.order ?? null,
    }))
  );

  const noteItems: StudioItem[] = await Promise.all(
    notes.map(async (item) => ({
      kind: "note" as const,
      slug: item.slug,
      href: `/notes/${item.slug}`,
      title: item.entry.title,
      description: item.entry.summary,
      tags: [...(item.entry.tags ?? [])],
      date: item.entry.date ?? null,
      image: item.entry.image ?? null,
      imageFocus: "center",
      blurDataURL: item.entry.image
        ? await getBlurDataURL(item.entry.image)
        : undefined,
      externalUrl: null,
      featured: item.entry.featured ?? false,
      order: item.entry.order ?? null,
    }))
  );

  const items = sortStudioItems([...projectItems, ...noteItems]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Studio</h1>
      <p className={styles.subtitle}>
        My Projects and Notes, All in One Place.
      </p>
      <StudioGrid items={items} />
    </div>
  );
}
