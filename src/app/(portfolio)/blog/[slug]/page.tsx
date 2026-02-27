import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createReader } from "@keystatic/core/reader";
import { readTime } from "@/lib/readTime";
import { renderMarkdoc, extractText } from "@/lib/renderMarkdoc";
import config from "../../../../../keystatic.config";
import styles from "./page.module.css";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ slug: string }> };

const reader = createReader(process.cwd(), config);

export async function generateStaticParams() {
  const slugs = await reader.collections.posts.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await reader.collections.posts.read(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date ?? undefined,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await reader.collections.posts.read(slug);
  if (!post) notFound();

  const contentResult = await post.content();

  const dateObj = post.date ? new Date(`${post.date}T12:00:00Z`) : null;
  const formatted =
    dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : post.date ?? "";

  const plainText = extractText(contentResult.node);

  return (
    <div className="section-wrapper">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date ?? undefined,
        author: { "@type": "Person", name: "Kendall Adkins" },
        image: post.coverImage ?? undefined,
      }} />
      <div className={styles.header}>
        <p className="section-label">Blog</p>
        <h1 className="section-title">{post.title}</h1>
        <div className={styles.meta}>
          {post.date && <time dateTime={post.date}>{formatted}</time>}
          {plainText && <span>{readTime(plainText)}</span>}
        </div>
      </div>

      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt={`Cover image for ${post.title}`}
          width={900}
          height={500}
          className={styles.coverImage}
          priority
        />
      )}

      <article className={styles.content}>
        {renderMarkdoc(contentResult)}
      </article>
    </div>
  );
}
