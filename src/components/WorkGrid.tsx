"use client";

import { useMemo, useState } from "react";
import type { WorkItem } from "@/types";
import WorkCard from "./WorkCard";
import styles from "./WorkGrid.module.css";

type Props = {
  items: WorkItem[];
};

export default function WorkGrid({ items }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [items]);

  const filteredItems =
    filter === "all"
      ? items
      : items.filter((item) => item.tags.includes(filter));

  return (
    <>
      {allTags.length > 1 && (
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`${styles.filterButton} ${filter === tag ? styles.active : ""}`}
              aria-pressed={filter === tag}
              onClick={() => setFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length > 0 ? (
        <div className={styles.grid}>
          {filteredItems.map((item, index) => (
            <WorkCard
              key={item.slug}
              slug={item.slug}
              title={item.title}
              description={item.description}
              tags={item.tags}
              image={item.image}
              imageFocus={item.imageFocus}
              blurDataURL={item.blurDataURL}
              externalUrl={item.externalUrl}
              priority={index < 4}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>No projects yet.</div>
      )}
    </>
  );
}
