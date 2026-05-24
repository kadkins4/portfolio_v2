import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../../keystatic.config";
import Tag from "@/components/Tag";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";
import styles from "./page.module.css";

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
      images: item.image ? [item.image] : [],
    },
  };
}

export default async function NoteDetailPage({ params }: Props) {
  const reader = getReader();
  const { slug } = await params;
  const item = await reader.collections.notes.read(slug);
  if (!item) notFound();

  const contentResult = await item.content();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Studio",
        item: `${SITE_URL}/studio`,
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
      <div className={styles.container}>
        <Link href="/studio" className={styles.backLink}>
          &larr; Back to Studio
        </Link>

        <header className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{item.title}</h1>
            {item.tags && item.tags.length > 0 && (
              <div className={styles.tags}>
                {item.tags.map((tag: string) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>
          {item.date && (
            <p className={styles.date}>
              {new Date(item.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </header>

        {item.image && (
          <Image
            src={item.image}
            alt={`${item.title} featured image`}
            width={1200}
            height={675}
            className={styles.image}
            priority
          />
        )}

        {contentResult && (
          <article className={styles.content}>
            {renderMarkdoc(contentResult)}
          </article>
        )}
      </div>
    </>
  );
}
