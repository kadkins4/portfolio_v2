"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import PageShell from "./PageShell";
import PageTitle from "./PageTitle";
import ContactDispatch, { type SocialLink } from "./ContactDispatch";
import type { WorkItem } from "./SelectedWork";
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

function yearOf(date: string | null): string {
  if (!date) return "";
  const y = date.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : "";
}

function ProjectCard({ item }: { item: WorkItem }) {
  const d = districtOf(item.slug, item.tags);
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
    const k = districtOf(p.slug, p.tags).key;
    if (!presentDistricts.includes(k)) presentDistricts.push(k);
  }

  const q = query.trim().toLowerCase();
  const matchesQuery = (hay: string) => !q || hay.toLowerCase().includes(q);

  const visibleProjects =
    filter === "notes"
      ? []
      : projects.filter(
          (p) =>
            (filter === "all" || districtOf(p.slug, p.tags).key === filter) &&
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

  return (
    <PageShell active="projects" name={name}>
      <PageTitle
        hue="cyan"
        kicker="✦ ENGINEERING DISTRICT · MIXED ZONING"
        door="DOOR 01 / 03"
        title={
          <>
            Work <i>&amp;</i> words, <br />
            one street.
          </>
        }
        sub="kendall@city:~$ cd projects/ && ls --lit"
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
        <div className={styles.grid}>
          {grid.map((g) =>
            g.kind === "project" ? (
              <ProjectCard key={`p-${g.item.slug}`} item={g.item} />
            ) : (
              <NoteCard key={`n-${g.item.slug}`} item={g.item} />
            )
          )}
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
