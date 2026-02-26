import Link from "next/link";
import Image from "next/image";
import styles from "./ProjectCard.module.css";

type Props = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  coverImage?: string | null;
  index: number;
};

export default function ProjectCard({ slug, title, description, tags, coverImage, index }: Props) {
  return (
    <Link href={`/projects/${slug}`} className={styles.card}>
      {coverImage && (
        <Image
          src={coverImage}
          alt={`${title} preview`}
          width={800}
          height={400}
          className={styles.image}
        />
      )}
      <div className={styles.number}>0{index + 1}</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.desc}>{description}</p>
      <div className={styles.tags} aria-label="Technologies used">
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
    </Link>
  );
}
