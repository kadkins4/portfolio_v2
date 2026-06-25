import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../../keystatic.config";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";
import HoloFrame from "@/components/holo/HoloFrame";
import HoloReveal from "@/components/holo/HoloReveal";
import page from "@/components/holo/holoPage.module.css";
import styles from "./note.module.css";

type Props = { params: Promise<{ slug: string }> };

const getReader = cache(() => createReader(process.cwd(), config));

export async function generateStaticParams() {
  const reader = getReader();
  const items = await reader.collections.notes.all();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const reader = getReader();
  const { slug } = await params;
  const item = await reader.collections.notes.read(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/notes/${slug}` },
    openGraph: {
      title: item.title,
      description: item.summary,
      type: "article",
      // When a note has its own image, use it. Otherwise omit images so the
      // generated opengraph-image (branded card with the title) is used.
      ...(item.image ? { images: [item.image] } : {}),
    },
  };
}

export default async function NoteDetailPage({ params }: Props) {
  const reader = getReader();
  const { slug } = await params;
  const item = await reader.collections.notes.read(slug);
  if (!item) notFound();

  const [home, contentResult] = await Promise.all([
    reader.singletons.home.read(),
    item.content(),
  ]);

  const name = home?.title ?? "Kendall Adkins";
  const isLife = item.side === "life";
  const tags = item.tags ?? [];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Field Notes",
        item: `${SITE_URL}/notes`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: `${SITE_URL}/notes/${slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <HoloFrame name={name}>
        <HoloReveal
          amber={isLife}
          command={`cat notes/${slug}.md`}
          name={name}
          head={<h1 className={page.title}>{item.title}</h1>}
        >
          <div className={`${styles.metaRow} ${page.rise}`}>
            {item.date && (
              <span className={styles.date}>
                {new Date(item.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
            {tags.length > 0 && (
              <div className={page.chips}>
                {tags.map((tag) => (
                  <span key={tag} className={page.chip}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {item.image && (
            <div className={page.rise}>
              <Image
                src={item.image}
                alt={`${item.title} featured image`}
                width={1200}
                height={675}
                className={styles.image}
                priority
              />
            </div>
          )}

          {contentResult && (
            <article className={`${page.prose} ${page.rise}`}>
              {renderMarkdoc(contentResult)}
            </article>
          )}

          <div className={`${styles.back} ${page.rise}`}>
            <Link href="/notes" className={page.cta}>
              ← cd notes/
            </Link>
          </div>
        </HoloReveal>
      </HoloFrame>
    </>
  );
}
