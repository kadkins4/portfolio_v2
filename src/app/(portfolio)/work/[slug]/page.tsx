import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../../keystatic.config";
import Tag from "@/components/Tag";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

const reader = createReader(process.cwd(), config);

export async function generateStaticParams() {
  const items = await reader.collections.work.all();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
  const { slug } = await params;
  const item = await reader.collections.work.read(slug);

  if (!item) {
    notFound();
  }

  const contentResult = await item.content();

  return (
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
          alt=""
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
          View Live &rarr;
        </a>
      )}
    </div>
  );
}
