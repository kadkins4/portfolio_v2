import Link from "next/link";
import Tag from "./Tag";
import styles from "./NoteCard.module.css";

type Props = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  date: string | null;
  image: string | null;
};

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function NoteCard({ slug, title, summary, tags, date }: Props) {
  return (
    <article className={styles.card}>
      <Link href={`/notes/${slug}`} className={styles.link}>
        <div className={styles.meta}>
          {tags[0] && <Tag variant="skill">{tags[0]}</Tag>}
          {date && <span className={styles.date}>{formatDate(date)}</span>}
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.summary}>{summary}</p>
        <span className={styles.read}>Read →</span>
      </Link>
    </article>
  );
}
