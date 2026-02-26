import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createReader } from "@keystatic/core/reader";
import { readTime } from "@/lib/readTime";
import config from "../../../../../keystatic.config";
import styles from "./page.module.css";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const reader = createReader(process.cwd(), config);
  const slugs = await reader.collections.posts.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const reader = createReader(process.cwd(), config);
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
  const reader = createReader(process.cwd(), config);
  const post = await reader.collections.posts.read(slug);
  if (!post) notFound();

  const contentResult = await post.content();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentNodes: any[] = (contentResult as unknown as any)?.node?.children ?? [];

  const dateObj = post.date ? new Date(`${post.date}T12:00:00Z`) : null;
  const formatted =
    dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : post.date ?? "";

  // Build plain text for read time estimation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plainText = contentNodes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((node: any) => node.children?.map((c: any) => c.text ?? c.attributes?.content ?? "").join("") ?? "")
    .join(" ");

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
        {contentNodes.map((node: any, i: number) => {
          const text =
            node.children
              ?.map((c: any) => c.text ?? c.attributes?.content ?? "")
              .join("") ?? "";
          if (node.type === "heading") {
            const level = node.level ?? 2;
            if (level === 1) return <h2 key={i}>{text}</h2>;
            if (level === 3) return <h3 key={i}>{text}</h3>;
            if (level === 4) return <h4 key={i}>{text}</h4>;
            if (level === 5) return <h5 key={i}>{text}</h5>;
            if (level === 6) return <h6 key={i}>{text}</h6>;
            return <h2 key={i}>{text}</h2>;
          }
          return <p key={i}>{text}</p>;
        })}
      </article>
    </div>
  );
}
