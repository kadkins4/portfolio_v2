"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TypedReveal from "./TypedReveal";
import styles from "./selectedWork.module.css";

export type WorkItem = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string | null;
  image: string | null;
  imageFocus: string;
  blurDataURL?: string;
  externalUrl: string | null;
};

function yearOf(date: string | null): string {
  if (!date) return "";
  const y = date.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : "";
}

function Card({ item }: { item: WorkItem }) {
  const meta = [yearOf(item.date), item.tags[0]].filter(Boolean).join(" · ");

  return (
    <Link href={`/projects/${item.slug}`} className={styles.card} data-rise>
      <div className={styles.shot}>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 820px) 33vw, 100vw"
            placeholder={item.blurDataURL ? "blur" : "empty"}
            blurDataURL={item.blurDataURL}
            style={{ objectPosition: item.imageFocus }}
            className={styles.img}
          />
        ) : (
          <div className={styles.noShot} aria-hidden="true">
            {"</>"}
          </div>
        )}
        <span className={styles.sl} aria-hidden="true" />
        <span className={`${styles.bk} ${styles.tl}`} aria-hidden="true" />
        <span className={`${styles.bk} ${styles.br}`} aria-hidden="true" />
        {item.externalUrl && (
          <span
            className={styles.live}
            role="link"
            tabIndex={0}
            aria-label={`Open ${item.title} live`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(item.externalUrl!, "_blank", "noopener,noreferrer");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                window.open(item.externalUrl!, "_blank", "noopener,noreferrer");
              }
            }}
          >
            live ↗
          </span>
        )}
      </div>

      {meta && <div className={styles.meta}>{meta}</div>}
      <h3 className={styles.cardTitle}>{item.title}</h3>
      <p className={styles.desc}>{item.description}</p>

      {item.tags.length > 0 && (
        <div className={styles.chips}>
          {item.tags.map((t) => (
            <span key={t} className={styles.chip}>
              {t}
            </span>
          ))}
        </div>
      )}

      <span className={styles.open} aria-hidden="true">
        → open
      </span>
    </Link>
  );
}

export default function SelectedWork({
  name = "Kendall Adkins",
  items,
}: {
  name?: string;
  items: WorkItem[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const tags = useMemo(() => {
    const seen = new Set<string>();
    for (const it of items) for (const t of it.tags) seen.add(t);
    return ["all", ...Array.from(seen)];
  }, [items]);

  const visible = useMemo(
    () =>
      filter === "all" ? items : items.filter((it) => it.tags.includes(filter)),
    [items, filter]
  );

  return (
    <TypedReveal
      wide
      name={name}
      head={
        <div className={styles.head}>
          <h1 className={styles.title}>Work</h1>
          <span className={styles.entries}>
            <span className={styles.dot} aria-hidden="true" />
            {items.length} PROJECTS
          </span>
        </div>
      }
      steps={[
        { kind: "command", text: "ls work/" },
        {
          kind: "reveal",
          node: (
            <>
              <p className={styles.lede} data-rise>
                Shipping for millions one day, building a fantasy-draft tool the
                next. Sports betting and cybersecurity at scale, plus the side
                projects I run myself. Click any card for the writeup; live ones
                link out.
              </p>

              {tags.length > 1 && (
                <div className={styles.filters} data-rise>
                  {tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.fchip} ${filter === t ? styles.fon : ""}`}
                      onClick={() => setFilter(t)}
                    >
                      {t === "all" ? "all" : t}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.grid}>
                {visible.map((it) => (
                  <Card key={it.slug} item={it} />
                ))}
              </div>

              <div className={styles.foot} data-rise>
                &gt; {visible.length} of {items.length} shown — still shipping
                <span className={styles.cur} aria-hidden="true" />
              </div>
            </>
          ),
        },
      ]}
    />
  );
}
