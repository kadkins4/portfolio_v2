import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import { getBlurDataURL } from "@/lib/getBlurDataURL";
import { sortStudioItems } from "@/lib/sortStudioItems";
import { districtOf } from "@/lib/district";
import config from "../../../../../keystatic.config";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";
import type { StudioItem } from "@/types";
import ProjectStorefront, {
  type NextStorefront,
} from "@/components/holo/ProjectStorefront";
import type { SocialLink } from "@/components/holo/ContactDispatch";

type Props = {
  params: Promise<{ slug: string }>;
};

const getReader = cache(() => createReader(process.cwd(), config));

export async function generateStaticParams() {
  const reader = getReader();
  const items = await reader.collections.projects.all();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const reader = getReader();
  const { slug } = await params;
  const item = await reader.collections.projects.read(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: item.title,
      description: item.description,
      type: "article",
      images: item.image ? [item.image] : [],
    },
  };
}

function yearOf(date: string | null): string {
  if (!date) return "";
  const y = date.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : "";
}

export default async function ProjectDetailPage({ params }: Props) {
  const reader = getReader();
  const { slug } = await params;
  const [item, home, allProjects, settings] = await Promise.all([
    reader.collections.projects.read(slug),
    reader.singletons.home.read(),
    reader.collections.projects.all(),
    reader.singletons.siteSettings.read(),
  ]);

  if (!item) notFound();

  const name = home?.title ?? "Kendall Adkins";
  const tags = [...(item.tags ?? [])];
  const district = districtOf(slug, tags);
  const contentResult = await item.content();

  // ordered slug list → find the next storefront
  const ordered: StudioItem[] = sortStudioItems(
    allProjects.map((p) => ({
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
    }))
  );
  const idx = ordered.findIndex((p) => p.slug === slug);
  const nextItem =
    ordered.length > 1 ? ordered[(idx + 1) % ordered.length] : null;
  const next: NextStorefront | null = nextItem
    ? {
        slug: nextItem.slug,
        title: nextItem.title,
        district: districtOf(nextItem.slug, nextItem.tags),
      }
    : null;

  const blurDataURL = item.image ? await getBlurDataURL(item.image) : undefined;

  const socials: SocialLink[] = (settings?.socialLinks ?? []).map((s) => ({
    platform: s.platform,
    url: s.url,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${SITE_URL}/projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: `${SITE_URL}/projects/${slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <ProjectStorefront
        name={name}
        slug={slug}
        title={item.title}
        district={district}
        year={yearOf(item.date ?? null)}
        live={item.externalUrl || null}
        image={item.image ?? null}
        imageFocus={item.imageFocus ?? "center"}
        blurDataURL={blurDataURL}
        tags={tags}
        next={next}
        socials={socials.length ? socials : undefined}
      >
        {contentResult && renderMarkdoc(contentResult)}
      </ProjectStorefront>
    </>
  );
}
