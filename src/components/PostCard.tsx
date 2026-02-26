import Link from "next/link";
import Image from "next/image";
import { readTime } from "@/lib/readTime";
import styles from "./PostCard.module.css";

type Props = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage?: string | null;
  contentPreview?: string;
};

export default function PostCard({ slug, title, excerpt, date, coverImage, contentPreview }: Props) {
  const formatted = new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <Link href={`/blog/${slug}`} className={styles.card}>
      {coverImage && (
        <Image src={coverImage} alt="" width={800} height={360} className={styles.image} />
      )}
      <div className={styles.meta}>
        <time dateTime={date}>{formatted}</time>
        {contentPreview && <span>{readTime(contentPreview)}</span>}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.excerpt}>{excerpt}</p>
    </Link>
  );
}
