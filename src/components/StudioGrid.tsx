"use client";

import { useEffect, useMemo, useState } from "react";
import type { StudioItem } from "@/types";
import ProjectCard from "./ProjectCard";
import NoteCard from "./NoteCard";
import styles from "./StudioGrid.module.css";

type Props = { items: StudioItem[] };
type Filter = { kind: "all" | "project" | "note" } | { tag: string };

// Number of masonry columns, responsive to viewport. Defaults to 2 for SSR
// and the desktop-first paint; corrected to 1 on narrow screens after mount.
function useColumnCount() {
  const [columns, setColumns] = useState(2);
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setColumns(mq.matches ? 1 : 2);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return columns;
}

export default function StudioGrid({ items }: Props) {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const columnCount = useColumnCount();

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const filtered = items.filter((item) => {
    if ("tag" in filter) return item.tags.includes(filter.tag);
    if (filter.kind === "all") return true;
    return item.kind === filter.kind;
  });

  // Distribute round-robin (item 0 -> col 0, item 1 -> col 1, item 2 -> col 0…)
  // so reading order stays row-first (1 & 2, then 3 & 4) while each column
  // stacks independently — letting shorter cards pull the next item up.
  const columns: { item: StudioItem; index: number }[][] = Array.from(
    { length: columnCount },
    () => []
  );
  filtered.forEach((item, index) =>
    columns[index % columnCount].push({ item, index })
  );

  const isKind = (k: "all" | "project" | "note") =>
    "kind" in filter && filter.kind === k;
  const isTag = (t: string) => "tag" in filter && filter.tag === t;

  return (
    <>
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${isKind("all") ? styles.active : ""}`}
          aria-pressed={isKind("all")}
          onClick={() => setFilter({ kind: "all" })}
        >
          All
        </button>
        <button
          className={`${styles.filterButton} ${isKind("project") ? styles.active : ""}`}
          aria-pressed={isKind("project")}
          onClick={() => setFilter({ kind: "project" })}
        >
          Projects
        </button>
        <button
          className={`${styles.filterButton} ${isKind("note") ? styles.active : ""}`}
          aria-pressed={isKind("note")}
          onClick={() => setFilter({ kind: "note" })}
        >
          Notes
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`${styles.filterButton} ${isTag(tag) ? styles.active : ""}`}
            aria-pressed={isTag(tag)}
            onClick={() => setFilter({ tag })}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className={styles.masonry}>
          {columns.map((column, ci) => (
            <div key={ci} className={styles.column}>
              {column.map(({ item, index }) =>
                item.kind === "project" ? (
                  <div key={item.href} className={styles.cell}>
                    <ProjectCard
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
                  </div>
                ) : (
                  <div key={item.href} className={styles.cell}>
                    <NoteCard
                      slug={item.slug}
                      title={item.title}
                      summary={item.description}
                      tags={item.tags}
                      date={item.date}
                      image={item.image}
                    />
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>Nothing here yet.</div>
      )}
    </>
  );
}
