import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import NeonCity from "@/components/holo/NeonCity";
import { sortStudioItems } from "@/lib/sortStudioItems";
import { districtOf } from "@/lib/district";
import { statusOf } from "@/lib/projectStatus";
import type { StudioItem } from "@/types";
import type { CityProject } from "@/lib/galleriaUnits";

export const metadata: Metadata = {
  title: "Neon City",
  description:
    "Walk the neon city, a top-down overworld linking Kendall Adkins' projects, resume, and about.",
  alternates: { canonical: "/city" },
};

export default async function CityPage() {
  const reader = createReader(process.cwd(), config);
  const [home, projects] = await Promise.all([
    reader.singletons.home.read(),
    reader.collections.projects.all(),
  ]);

  // The mall shows every project — including in-progress ones, which appear as
  // construction units. Ordering matches the projects index (featured → order
  // → date) so the anchors are the featured work.
  const studio: StudioItem[] = projects.map((p) => ({
    kind: "project" as const,
    slug: p.slug,
    href: `/projects/${p.slug}`,
    title: p.entry.title,
    description: p.entry.description,
    tags: [...(p.entry.tags ?? [])],
    date: p.entry.date ?? null,
    image: p.entry.image ?? null,
    imageFocus: p.entry.imageFocus ?? "center",
    externalUrl: p.entry.externalUrl ?? null,
    featured: p.entry.featured ?? false,
    order: p.entry.order ?? null,
    district: p.entry.district ?? null,
  }));

  const bySlug = new Map(projects.map((p) => [p.slug, p.entry]));

  const cityProjects: CityProject[] = sortStudioItems(studio).map((it) => {
    const entry = bySlug.get(it.slug);
    const d = districtOf(it.slug, it.tags, it.district);
    return {
      slug: it.slug,
      title: it.title,
      description: it.description,
      cityBlurb: entry?.cityBlurb || null,
      status: statusOf(entry ?? {}),
      hue: d.hue,
      districtLabel: d.label,
    };
  });

  return (
    <NeonCity name={home?.title ?? "Kendall Adkins"} projects={cityProjects} />
  );
}
