"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import Link from "next/link";
import PageShell from "./PageShell";
import PageTitle from "./PageTitle";
import ContactDispatch, { type SocialLink } from "./ContactDispatch";
import { PAGE_COPY } from "@/lib/constants";
import type { WorkItem } from "@/types";
import {
  districtOf,
  districtColor,
  DISTRICTS,
  type DistrictKey,
} from "@/lib/district";

export type NoteItem = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  side: "craft" | "life";
  date: string | null;
};
import styles from "./projectsDistrict.module.css";

type Filter = "all" | DistrictKey | "notes";

// useLayoutEffect on the client (measure before paint, no flash), useEffect on
// the server (avoids the SSR warning). The grid renders as a plain CSS grid
// until this runs, so no-JS users still get a valid 3-up layout.
const useIsoLayout =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const COL_GAP = 18;
const ROW_GAP = 18;

// column count by container width — mirrors the CSS grid breakpoints
function columnsFor(width: number): number {
  if (width < 640) return 1;
  if (width < 900) return 2;
  return 3;
}

function yearOf(date: string | null): string {
  if (!date) return "";
  const y = date.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : "";
}

function ProjectCard({ item }: { item: WorkItem }) {
  const d = districtOf(item.slug, item.tags, item.district);
  const vars = {
    "--acc": districtColor(d, 0.84),
    "--acc-dim": districtColor(d, 0.8, 0.3),
    "--acc-glow": districtColor(d, 0.75, 0.26),
  } as CSSProperties;
  return (
    <Link
      href={`/projects/${item.slug}`}
      className={styles.card}
      style={vars}
      data-rise
    >
      <span className={styles.topStrip} aria-hidden="true" />
      {item.image ? (
        <div className={styles.shot}>
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 900px) 33vw, 100vw"
            placeholder={item.blurDataURL ? "blur" : "empty"}
            blurDataURL={item.blurDataURL}
            style={{ objectPosition: item.imageFocus }}
            className={styles.img}
          />
          <span className={`${styles.bk} ${styles.tl}`} aria-hidden="true" />
          <span className={`${styles.bk} ${styles.br}`} aria-hidden="true" />
        </div>
      ) : null}
      <div className={styles.body}>
        <div className={styles.metaRow}>
          <span className={styles.tag}>{d.label}</span>
          <span className={styles.metaRight}>
            {[yearOf(item.date), item.tags[0]].filter(Boolean).join(" · ")}
          </span>
        </div>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.blurb}>{item.description}</p>
        <div className={styles.cardFoot}>
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden="true" />
            {item.externalUrl ? "LIVE" : "CASE STUDY"}
          </span>
          <span className={styles.openLink}>open detail →</span>
        </div>
      </div>
    </Link>
  );
}

function NoteCard({ item }: { item: NoteItem }) {
  return (
    <Link href={`/notes/${item.slug}`} className={styles.note} data-rise>
      <div className={styles.noteBody}>
        <div className={styles.noteTag}>✦ NOTE</div>
        <h3 className={styles.noteTitle}>{item.title}</h3>
        {item.summary && <p className={styles.noteSummary}>{item.summary}</p>}
        <span className={styles.noteRead}>read at the newsstand ↗</span>
      </div>
    </Link>
  );
}

export default function ProjectsDistrict({
  name = "Kendall Adkins",
  projects,
  notes,
  socials,
}: {
  name?: string;
  projects: WorkItem[];
  notes: NoteItem[];
  socials?: SocialLink[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const presentDistricts: DistrictKey[] = [];
  for (const p of projects) {
    const k = districtOf(p.slug, p.tags, p.district).key;
    if (!presentDistricts.includes(k)) presentDistricts.push(k);
  }

  const q = query.trim().toLowerCase();
  const matchesQuery = (hay: string) => !q || hay.toLowerCase().includes(q);

  const visibleProjects =
    filter === "notes"
      ? []
      : projects.filter(
          (p) =>
            (filter === "all" ||
              districtOf(p.slug, p.tags, p.district).key === filter) &&
            matchesQuery(`${p.title} ${p.description} ${p.tags.join(" ")}`)
        );

  const visibleNotes =
    filter !== "all" && filter !== "notes"
      ? []
      : notes.filter((n) =>
          matchesQuery(`${n.title} ${n.summary} ${n.tags.join(" ")}`)
        );

  // interleave: a note pinned after every third storefront, remainder appended
  const grid: Array<
    { kind: "project"; item: WorkItem } | { kind: "note"; item: NoteItem }
  > = [];
  let ni = 0;
  visibleProjects.forEach((p, i) => {
    grid.push({ kind: "project", item: p });
    if ((i + 1) % 3 === 0 && ni < visibleNotes.length) {
      grid.push({ kind: "note", item: visibleNotes[ni++] });
    }
  });
  while (ni < visibleNotes.length)
    grid.push({ kind: "note", item: visibleNotes[ni++] });

  const total = visibleProjects.length + visibleNotes.length;

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: "all" },
    ...presentDistricts.map((k) => ({
      key: k,
      label: DISTRICTS[k].label.toLowerCase(),
    })),
    { key: "notes", label: "notes" },
  ];

  // ---- masonry: place each card in the shortest column so short cards let the
  // next card shift up to fill the gap. First N cards fill the N empty columns,
  // so the top row stays 1·2·3 (most-important first) and only later cards
  // zig-zag. Re-runs on width change and whenever the visible set changes.
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const itemCount = grid.length;
  const layoutKey = grid.map((g) => `${g.kind}:${g.item.slug}`).join("|");

  useIsoLayout(() => {
    const container = containerRef.current;
    if (!container || itemCount === 0) {
      setReady(false);
      return;
    }
    let lastWidth = -1;

    const layout = () => {
      const width = container.clientWidth;
      if (width === 0) return;
      lastWidth = width;
      const items = itemRefs.current
        .slice(0, itemCount)
        .filter((el): el is HTMLDivElement => el != null);
      const cols = columnsFor(width);
      const colW = (width - (cols - 1) * COL_GAP) / cols;
      const heights = new Array<number>(cols).fill(0);
      for (const el of items) {
        el.style.width = `${colW}px`;
        let c = 0;
        for (let k = 1; k < cols; k++) if (heights[k] < heights[c]) c = k;
        el.style.left = `${c * (colW + COL_GAP)}px`;
        el.style.top = `${heights[c]}px`;
        heights[c] += el.offsetHeight + ROW_GAP;
      }
      container.style.height = `${Math.max(...heights) - ROW_GAP}px`;
    };

    layout();
    setReady(true);

    // only relayout on width change — we mutate height ourselves, so guarding on
    // width avoids a feedback loop with the ResizeObserver.
    const ro = new ResizeObserver(() => {
      if (container.clientWidth !== lastWidth) layout();
    });
    ro.observe(container);
    return () => {
      ro.disconnect();
      container.style.height = "";
    };
  }, [layoutKey, itemCount]);

  return (
    <PageShell active="projects" name={name}>
      <PageTitle
        hue="cyan"
        kicker={PAGE_COPY.projects.kicker}
        door="DOOR 01 / 03"
        title={PAGE_COPY.projects.title}
        sub={PAGE_COPY.projects.sub}
      />

      <p className={styles.lede}>
        A decade of products, tools, and side projects, with notes and essays
        pinned up between the storefronts. Walk the grid, or grep for what you
        need.
      </p>

      <div className={styles.filterBar}>
        <label className={styles.grep}>
          <span className={styles.grepLabel}>&gt; grep</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="search the district_"
            className={styles.grepInput}
            aria-label="search projects"
          />
        </label>
        <div className={styles.chips}>
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`${styles.chip} ${filter === c.key ? styles.chipOn : ""} ${
                c.key === "notes" ? styles.chipNote : ""
              }`}
              onClick={() => setFilter(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <span className={styles.count}>
          <span className={styles.countDot} aria-hidden="true" />
          {total} LOTS LIT
        </span>
      </div>

      {total > 0 ? (
        <div
          ref={containerRef}
          className={`${styles.grid} ${ready ? styles.msReady : ""}`}
        >
          {grid.map((g, i) => (
            <div
              key={
                g.kind === "project" ? `p-${g.item.slug}` : `n-${g.item.slug}`
              }
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={ready ? styles.msItem : undefined}
            >
              {g.kind === "project" ? (
                <ProjectCard item={g.item} />
              ) : (
                <NoteCard item={g.item} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          &gt; grep: nothing on this block matches &ldquo;{query.trim()}&rdquo;.
          try another district
        </p>
      )}

      <div className={styles.contactWrap}>
        <ContactDispatch socials={socials} />
      </div>
      <div className={styles.footer}>© 2026 KENDALL ADKINS · NEON CITY</div>
    </PageShell>
  );
}
