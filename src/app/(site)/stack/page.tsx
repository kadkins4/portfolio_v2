import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import HoloFrame from "@/components/holo/HoloFrame";
import HoloReveal from "@/components/holo/HoloReveal";
import page from "@/components/holo/holoPage.module.css";
import styles from "./stack.module.css";

export const metadata: Metadata = {
  title: "The Stack",
  description:
    "The tools Kendall Adkins builds with, grouped by how often they are in his hands.",
};

type Tier = { group: string; tagline: string; match: string[] };

// Sensible grouping of his real skills. `match` lists the skills (verbatim from
// the about singleton) that belong in each tier; any skill not matched falls
// into a catch-all card so nothing is dropped.
const TIERS: Tier[] = [
  {
    group: "Frontend",
    tagline: "Where most of my day lives. Components, types, routing.",
    match: ["React", "TypeScript", "Next.js"],
  },
  {
    group: "Backend & Data",
    tagline:
      "The other half of the stack. APIs, services, and the data behind them.",
    match: ["Node.js", "GraphQL", "REST APIs", "Python"],
  },
  {
    group: "Quality",
    tagline: "How I keep shipped work honest.",
    match: ["Testing (Jest/Vitest)"],
  },
  {
    group: "How I Work",
    tagline: "Less about syntax, more about getting things over the line.",
    match: ["AI-Assisted Development", "Mentoring", "Project Planning"],
  },
  {
    group: "Playing Around",
    tagline: "Side-project territory. Picked up for the fun of it.",
    match: ["Unity 2D"],
  },
];

export default async function StackPage() {
  const reader = createReader(process.cwd(), config);
  const [home, about] = await Promise.all([
    reader.singletons.home.read(),
    reader.singletons.about.read(),
  ]);

  const name = home?.title ?? "Kendall Adkins";
  const skills: string[] = [...(about?.skills ?? [])];

  // Assign each skill to a tier; collect leftovers into a catch-all.
  const claimed = new Set<string>();
  const cards = TIERS.map((tier) => {
    const items = skills.filter((s) => tier.match.includes(s));
    items.forEach((s) => claimed.add(s));
    return { group: tier.group, tagline: tier.tagline, items };
  }).filter((card) => card.items.length > 0);

  const leftover = skills.filter((s) => !claimed.has(s));
  if (leftover.length > 0) {
    cards.push({
      group: "Also In The Box",
      tagline: "Everything else I reach for.",
      items: leftover,
    });
  }

  return (
    <HoloFrame name={name}>
      <HoloReveal
        wide
        command="cat stack.txt"
        name={name}
        head={
          <div className={page.head}>
            <h1 className={page.title}>
              The <i>Stack</i>
            </h1>
            <span className={page.entries}>
              <span className={page.dot} aria-hidden="true" />
              {skills.length} TOOLS
            </span>
          </div>
        }
      >
        <p className={`${page.lede} ${page.rise}`}>
          What I build with, grouped by how often it is actually in my hands.
          The top of the list is daily-driver stuff; the bottom is where I go to
          play. No percentages, no proficiency bars. Just an honest map of the
          toolbox.
        </p>

        <div className={`${styles.grid} ${page.rise}`}>
          {cards.map((card) => (
            <div key={card.group} className={styles.scard}>
              <span className={styles.sl} aria-hidden="true" />
              <span
                className={`${styles.bk} ${styles.tl}`}
                aria-hidden="true"
              />
              <span
                className={`${styles.bk} ${styles.br}`}
                aria-hidden="true"
              />
              <h3 className={styles.group}>{card.group}</h3>
              <p className={styles.tagline}>{card.tagline}</p>
              <div className={styles.items}>
                {card.items.map((item) => (
                  <span key={item} className={page.chip}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`${page.foot} ${page.rise}`}>
          &gt; end of stack.txt
          <span className={page.cur} aria-hidden="true" />
        </div>
      </HoloReveal>
    </HoloFrame>
  );
}
