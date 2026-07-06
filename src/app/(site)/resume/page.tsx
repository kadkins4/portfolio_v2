import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import ResumeLine, {
  type Station,
  type SkillGroup,
} from "@/components/holo/ResumeLine";
import { toSocialLinks } from "@/lib/socialLinks";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "The Adkins Line — a decade of engineering as a transit map, most recent first.",
  alternates: { canonical: "/resume" },
};

// era hues by station index (education overrides to green + ORIGIN)
const ERA: { hue: number; chroma: number }[] = [
  { hue: 190, chroma: 0.13 }, // cyan
  { hue: 340, chroma: 0.16 }, // pink
  { hue: 300, chroma: 0.11 }, // violet
  { hue: 46, chroma: 0.14 }, // amber
  { hue: 20, chroma: 0.14 }, // rose
];
const GREEN = { hue: 150, chroma: 0.15 };

// "Mar 2022 – May 2026" → "2022 — 2026"; single year stays single.
function yearRange(period: string): string {
  const years = period.match(/\d{4}/g) ?? [];
  if (years.length === 0) return period;
  const start = years[0];
  const end = years[years.length - 1];
  return start === end ? start : `${start} — ${end}`;
}
export default async function ResumePage() {
  const reader = createReader(process.cwd(), config);
  const [home, resume, settings] = await Promise.all([
    reader.singletons.home.read(),
    reader.singletons.resume.read(),
    reader.singletons.siteSettings.read(),
  ]);

  if (!resume) notFound();

  const stations: Station[] = [];
  let idx = 0;

  for (const e of resume.experience) {
    const era = ERA[idx % ERA.length];
    stations.push({
      dates: yearRange(e.period),
      role: e.role,
      org: e.org.toUpperCase(),
      detail: e.detail,
      bullets: [...e.highlights],
      tech: [...e.tech],
      hue: era.hue,
      chroma: era.chroma,
    });
    idx += 1;
  }

  for (const e of resume.earlier) {
    const era = ERA[idx % ERA.length];
    stations.push({
      dates: yearRange(e.period),
      role: e.role,
      org: e.org.toUpperCase(),
      bullets: e.detail ? [e.detail] : [],
      tech: [],
      hue: era.hue,
      chroma: era.chroma,
    });
    idx += 1;
  }

  for (const e of resume.education) {
    stations.push({
      dates: yearRange(e.year),
      role: e.credential,
      org: e.school.toUpperCase(),
      bullets: [],
      tech: [],
      origin: true,
      hue: GREEN.hue,
      chroma: GREEN.chroma,
    });
  }

  const roleCount = resume.experience.length + resume.earlier.length;

  const socials = toSocialLinks(settings);
  const skillGroups: SkillGroup[] = resume.skillGroups.map((g) => ({
    label: g.label.toUpperCase(),
    accent: g.accent,
    items: [...g.items],
  }));

  return (
    <ResumeLine
      name={home?.title ?? "Kendall Adkins"}
      bio={resume.bio}
      resumePdf={resume.resumePdf || "/kendall-adkins-resume.pdf"}
      experienceLabel={`8+ YRS · ${roleCount} STOPS`}
      skillGroups={skillGroups}
      stations={stations}
      socials={socials}
    />
  );
}
