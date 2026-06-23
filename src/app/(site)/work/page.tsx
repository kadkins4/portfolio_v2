import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import { getBlurDataURL } from "@/lib/getBlurDataURL";
import { sortStudioItems } from "@/lib/sortStudioItems";
import type { StudioItem } from "@/types";
import HoloFrame from "@/components/holo/HoloFrame";
import SelectedWork, { type WorkItem } from "@/components/holo/SelectedWork";

export const metadata: Metadata = {
  title: "Selected Work",
  description:
    "Selected projects by Kendall Adkins — sports betting and cybersecurity at scale, plus self-run side projects.",
};

export default async function WorkPage() {
  const reader = createReader(process.cwd(), config);
  const [home, projects] = await Promise.all([
    reader.singletons.home.read(),
    reader.collections.projects.all(),
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
  }));

  const name = home?.title ?? "Kendall Adkins";

  return (
    <HoloFrame name={name}>
      <SelectedWork name={name} items={items} />
    </HoloFrame>
  );
}
