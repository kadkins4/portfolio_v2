"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import page from "./holoPage.module.css";
import styles from "../../app/(site)/notes/notes.module.css";

export type NoteItem = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  side: "craft" | "life";
  date: string | null;
};

function yearOf(date: string | null): string {
  if (!date) return "";
  const y = date.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : "";
}

function NoteCardLink({ item }: { item: NoteItem }) {
  const meta = [yearOf(item.date), item.tags[0]].filter(Boolean).join(" · ");
  const cardClass = `${styles.card} ${item.side === "life" ? styles.amber : ""}`;
  return (
    <Link href={`/notes/${item.slug}`} className={cardClass} data-rise>
      <div className={styles.meta}>
        <span className={styles.sideTag}>{item.side}</span>
        {meta && <> · {meta}</>}
      </div>
      <h2 className={styles.cardTitle}>{item.title}</h2>
      {item.summary && <p className={styles.summary}>{item.summary}</p>}
      <span className={styles.read} aria-hidden="true">
        → read
      </span>
    </Link>
  );
}

export default function FieldNotes({ items }: { items: NoteItem[] }) {
  const [filter, setFilter] = useState<"all" | "craft" | "life">("all");

  const counts = useMemo(() => {
    let craft = 0;
    let life = 0;
    for (const it of items) it.side === "life" ? (life += 1) : (craft += 1);
    return { all: items.length, craft, life };
  }, [items]);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((it) => it.side === filter)),
    [items, filter]
  );

  const tabs: Array<"all" | "craft" | "life"> = ["all", "craft", "life"];

  return (
    <>
      <p className={page.lede} data-rise>
        Essays and the occasional reference. Short and honest, written when a
        thing was worth writing down. Not a content farm.
      </p>

      <div className={styles.filters} data-rise>
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.fchip} ${filter === t ? styles.fon : ""}`}
            onClick={() => setFilter(t)}
          >
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      <div className={styles.list} data-rise>
        {visible.length > 0 ? (
          visible.map((it) => <NoteCardLink key={it.slug} item={it} />)
        ) : (
          <p className={styles.empty}>No notes here yet.</p>
        )}
      </div>

      <div className={page.foot} data-rise>
        &gt; {items.length} published
        <span className={page.cur} aria-hidden="true" />
      </div>
    </>
  );
}
