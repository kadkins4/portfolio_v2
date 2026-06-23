import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/lib/constants";
import Gateway from "@/components/holo/Gateway";

export const metadata: Metadata = {
  title: "Home",
  description: SITE_DESCRIPTION,
  openGraph: { title: SITE_TITLE, description: SITE_DESCRIPTION },
};

export default async function HomePage() {
  const reader = createReader(process.cwd(), config);
  const [home, projects, notes] = await Promise.all([
    reader.singletons.home.read(),
    reader.collections.projects.all(),
    reader.collections.notes.all(),
  ]);

  const name = home?.title ?? "Kendall Adkins";
  const projectCount = projects.length;
  const craftNotes = notes.filter((n) => n.entry.side !== "life").length;
  const lifeNotes = notes.filter((n) => n.entry.side === "life");

  return (
    <Gateway
      name={name}
      nav={[
        { label: "work", href: "/studio" },
        { label: "about", href: "/about" },
        { label: "notes", href: "/notes" },
        { label: "contact", href: "/about" },
      ]}
      craft={{
        title: "The Engineer",
        subtitle:
          "A decade shipping high-traffic web apps — sports betting, fintech, and cybersecurity. React and TypeScript, owned end to end.",
        dirs: [
          {
            name: "work/",
            desc: "selected projects",
            meta: String(projectCount),
            href: "/studio",
            preview: "thescore bet · loresmith · on the clock · vantage …",
          },
          {
            name: "resume/",
            desc: "a decade, in order",
            meta: "→",
            href: "/resume",
            preview: "penn · fidelis · aba · elon '12 — interactive log",
          },
          {
            name: "stack/",
            desc: "what I build with",
            meta: "→",
            href: "/about",
            preview: "react · next · typescript · node · keystatic",
          },
          {
            name: "notes/",
            desc: "essays & experiments",
            meta: String(craftNotes),
            href: "/notes",
            preview: "how i actually work with ai",
          },
        ],
      }}
      life={{
        title: "The Human",
        emphasizeLast: true,
        subtitle:
          "The person behind the commits — bachata, hot yoga, beach volleyball, D&D, and a move from Baltimore to the coast.",
        dirs: [
          {
            name: "story/",
            desc: "floors → senior eng",
            meta: "→",
            href: "/about",
            preview: "retail floor lead → ops manager → senior engineer",
          },
          {
            name: "life/",
            desc: "outside of code",
            meta: "→",
            href: "/about",
            preview: "bachata · hot yoga · volleyball · d&d · coasters",
          },
          {
            name: "perks/",
            desc: "referral codes & discounts",
            meta: String(lifeNotes.length),
            href: lifeNotes[0] ? `/notes/${lifeNotes[0].slug}` : "/notes",
            preview: "referral links for apps & services I actually use",
          },
        ],
      }}
    />
  );
}
