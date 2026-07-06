import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import { getBlurDataURL } from "@/lib/getBlurDataURL";
import { sortStudioItems } from "@/lib/sortStudioItems";
import type { StudioItem } from "@/types";
import ProjectsDistrict from "@/components/holo/ProjectsDistrict";
import type { WorkItem } from "@/components/holo/SelectedWork";
import type { NoteItem } from "@/components/holo/ProjectsDistrict";
import { toSocialLinks } from "@/lib/socialLinks";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected projects by Kendall Adkins: sports betting and cybersecurity at scale, plus self-run side projects.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const reader = createReader(process.cwd(), config);
  const [home, projects, notes, settings] = await Promise.all([
    reader.singletons.home.read(),
    reader.collections.projects.all(),
    reader.collections.notes.all(),
    reader.singletons.siteSettings.read(),
  ]);

  const studioItems: StudioItem[] = await Promise.all(
    projects.map(async (item) => ({
      kind: "project" as const,
      slug: item.slug,
      href: `/projects/${item.slug}`,
      title: item.entry.title,
      description: item.entry.description,
      tags: [...(item.entry.tags ?? [])],
      date: item.entry.date ?? null,
      image: item.entry.image ?? null,
      imageFocus: item.entry.imageFocus ?? "center",
      blurDataURL: item.entry.image
        ? await getBlurDataURL(item.entry.image)
        : undefined,
      externalUrl: item.entry.externalUrl ?? null,
      featured: item.entry.featured ?? false,
      order: item.entry.order ?? null,
      district: item.entry.district ?? null,
    }))
  );

  const items: WorkItem[] = sortStudioItems(studioItems).map((it) => ({
    slug: it.slug,
    title: it.title,
    description: it.description,
    tags: it.tags,
    date: it.date,
    image: it.image,
    imageFocus: it.imageFocus,
    blurDataURL: it.blurDataURL,
    externalUrl: it.externalUrl,
    district: it.district,
  }));

  // craft-side notes get pinned between the storefronts
  const craftNotes: NoteItem[] = notes
    .filter((n) => n.entry.side !== "life")
    .sort((a, b) => (b.entry.date ?? "").localeCompare(a.entry.date ?? ""))
    .map((n) => ({
      slug: n.slug,
      title: n.entry.title,
      summary: n.entry.summary,
      tags: [...(n.entry.tags ?? [])],
      side: "craft" as const,
      date: n.entry.date ?? null,
    }));

  const socials = toSocialLinks(settings);

  const name = home?.title ?? "Kendall Adkins";

  return (
    <ProjectsDistrict
      name={name}
      projects={items}
      notes={craftNotes}
      socials={socials}
    />
  );
}
