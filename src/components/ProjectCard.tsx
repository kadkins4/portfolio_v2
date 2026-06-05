import Link from "next/link";
import Image from "next/image";
import type { ProjectItem } from "@/types";
import Tag from "./Tag";
import styles from "./ProjectCard.module.css";

type Props = ProjectItem & {
  priority?: boolean;
};

export default function ProjectCard({
  slug,
  title,
  description,
  tags,
  image,
  imageFocus = "center",
  blurDataURL,
  externalUrl,
  priority = false,
}: Props) {
  return (
    <article className={styles.card}>
      <Link href={`/projects/${slug}`}>
        <div className={styles.imageWrapper}>
          {image ? (
            <Image
              src={image}
              alt={`${title} thumbnail`}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={priority}
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL}
              style={{ objectPosition: imageFocus }}
            />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.initial}>
                {title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {tags.length > 0 && (
            <div className={styles.tag}>
              <Tag>{tags[0]}</Tag>
            </div>
          )}
        </div>
        <h3 className={styles.title}>{title}</h3>
      </Link>
      <p className={styles.description}>{description}</p>
      {externalUrl && (
        <a
          href={externalUrl}
          className={styles.externalLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Live ↗
        </a>
      )}
    </article>
  );
}
