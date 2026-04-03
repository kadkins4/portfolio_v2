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
import styles from "./page.module.css";

const SITE_URL = "https://kendalladkins.com";

type Props = {
  params: Promise<{ slug: string }>;
};

const getReader = cache(() => createReader(process.cwd(), config));

export async function generateStaticParams() {
  const reader = getReader();
  const items = await reader.collections.work.all();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const reader = getReader();
  const { slug } = await params;
  const item = await reader.collections.work.read(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
      type: "article",
      images: item.image ? [item.image] : [],
    },
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const reader = getReader();
  const { slug } = await params;
  const item = await reader.collections.work.read(slug);

  if (!item) {
    notFound();
  }

  const contentResult = await item.content();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Work",
        item: `${SITE_URL}/work`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: `${SITE_URL}/work/${slug}`,
      },
    ],
  };

  const articleSchema =
    item.type === "writing"
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: item.title,
          description: item.description,
          image: item.image ? `${SITE_URL}${item.image}` : undefined,
          datePublished: item.date,
          author: {
            "@type": "Person",
            name: "Kendall Adkins",
            url: SITE_URL,
          },
        }
      : null;

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {articleSchema && <JsonLd data={articleSchema} />}
      <div className={styles.container}>
        <Link href="/work" className={styles.backLink}>
          &larr; Back to Work
        </Link>

        <header className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{item.title}</h1>
            <Tag variant={item.type}>{item.type}</Tag>
          </div>
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

        {item.externalUrl && (
          <a
            href={item.externalUrl}
            className={styles.externalLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Live ↗
          </a>
        )}
      </div>
    </>
  );
}
