import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import WorkGrid from "@/components/WorkGrid";
import { getBlurDataURL } from "@/lib/getBlurDataURL";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Projects, hobbies, and writing by Kendall Adkins — exploring software engineering, developer tools, and web development.",
  openGraph: {
    title: "Work — Kendall Adkins",
    description:
      "Projects, hobbies, and writing exploring software engineering, developer tools, and web development.",
  },
};

export default async function WorkPage() {
  const reader = createReader(process.cwd(), config);
  const workItems = await reader.collections.work.all();

  const sortedItems = workItems.sort((a, b) => {
    // Featured items come first
    const featuredA = a.entry.featured ? 1 : 0;
    const featuredB = b.entry.featured ? 1 : 0;
    if (featuredB !== featuredA) return featuredB - featuredA;

    // Among featured items, sort by order (lower first), then date
    if (a.entry.featured && b.entry.featured) {
      const orderA = a.entry.order ?? Infinity;
      const orderB = b.entry.order ?? Infinity;
      if (orderA !== orderB) return orderA - orderB;
    }

    // Fall back to date (newest first)
    const dateA = a.entry.date ? new Date(a.entry.date).getTime() : 0;
    const dateB = b.entry.date ? new Date(b.entry.date).getTime() : 0;
    return dateB - dateA;
  });

  const items = await Promise.all(
    sortedItems.map(async (item) => ({
      slug: item.slug,
      title: item.entry.title,
      description: item.entry.description,
      type: item.entry.type,
      image: item.entry.image ?? null,
      imageFocus: item.entry.imageFocus ?? "center",
      blurDataURL: item.entry.image
        ? await getBlurDataURL(item.entry.image)
        : undefined,
      externalUrl: item.entry.externalUrl ?? null,
    }))
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Projects, Hobbies, and Writing</h1>
      <WorkGrid items={items} />
    </div>
  );
}
