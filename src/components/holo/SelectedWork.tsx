"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import TypedReveal from "./TypedReveal";
import styles from "./selectedWork.module.css";

const PROMPT = "kendall@adkins:~$";

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
  const [query, setQuery] = useState("");
  const [shellFocused, setShellFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tags = useMemo(() => {
    const seen = new Set<string>();
    for (const it of items) for (const t of it.tags) seen.add(t);
    return ["all", ...Array.from(seen)];
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (filter !== "all" && !it.tags.includes(filter)) return false;
      if (!q) return true;
      const hay =
        `${it.title} ${it.description} ${it.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, filter, query]);

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setQuery("");
    }
  }

  return (
    <TypedReveal
      wide
      name={name}
      head={
        <div className={styles.head}>
          <h1 className={styles.title}>Projects</h1>
          <span className={styles.entries}>
            <span className={styles.dot} aria-hidden="true" />
            {items.length} PROJECTS
          </span>
        </div>
      }
      steps={[
        { kind: "command", text: "ls projects/" },
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

              <div
                className={`${styles.shell} ${shellFocused ? styles.shellFocused : ""}`}
                data-rise
                onMouseDown={(e) => {
                  e.preventDefault();
                  inputRef.current?.focus();
                }}
              >
                <div className={styles.shellLine}>
                  <span className={styles.ps}>{PROMPT}</span>
                  <span className={styles.shellCmd}>grep</span>
                  <span className={styles.shellEcho}>{query}</span>
                  <span className={styles.shellCur} aria-hidden="true" />
                  {!query && (
                    <span className={styles.shellHint}>
                      type to filter — try &quot;fantasy&quot; or
                      &quot;security&quot;
                    </span>
                  )}
                  <input
                    ref={inputRef}
                    className={styles.shellInput}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => setShellFocused(true)}
                    onBlur={() => setShellFocused(false)}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="search projects"
                  />
                </div>
              </div>

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

              {visible.length > 0 ? (
                <div className={styles.grid}>
                  {visible.map((it) => (
                    <Card key={it.slug} item={it} />
                  ))}
                </div>
              ) : (
                <p className={styles.empty} data-rise>
                  No projects match{" "}
                  <span className={styles.emptyQ}>
                    &ldquo;{query.trim()}&rdquo;
                  </span>
                  . Try a different term or clear the search.
                </p>
              )}

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
