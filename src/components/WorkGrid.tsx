"use client";

import { useState } from "react";
import type { WorkItem } from "@/types";
import WorkCard from "./WorkCard";
import styles from "./WorkGrid.module.css";

type FilterType = "all" | "project" | "writing" | "hobby";

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "project", label: "Projects" },
  { value: "writing", label: "Writing" },
  { value: "hobby", label: "Hobbies" },
];

type Props = {
  items: WorkItem[];
};

export default function WorkGrid({ items }: Props) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredItems =
    filter === "all" ? items : items.filter((item) => item.type === filter);

  const activeFilter = FILTERS.find((f) => f.value === filter);

  return (
    <>
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`${styles.filterButton} ${filter === f.value ? styles.active : ""}`}
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredItems.length > 0 ? (
        <div className={styles.grid}>
          {filteredItems.map((item, index) => (
            <WorkCard
              key={item.slug}
              slug={item.slug}
              title={item.title}
              description={item.description}
              type={item.type}
              image={item.image}
              imageFocus={item.imageFocus}
              blurDataURL={item.blurDataURL}
              externalUrl={item.externalUrl}
              priority={index < 4}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          No {activeFilter?.label.toLowerCase()} yet.
        </div>
      )}
    </>
  );
}
