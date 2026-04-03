import Link from "next/link";
import Image from "next/image";
import type { WorkItem } from "@/types";
import Tag from "./Tag";
import type { TagVariant } from "./Tag";
import styles from "./WorkCard.module.css";

type Props = WorkItem & {
  priority?: boolean;
};

export default function WorkCard({
  slug,
  title,
  description,
  type,
  image,
  imageFocus = "center",
  blurDataURL,
  externalUrl,
  priority = false,
}: Props) {
  const tagVariant: TagVariant = type;

  return (
    <article className={styles.card}>
      <Link href={`/work/${slug}`}>
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
              <div className={styles.divider} />
              <span className={styles.typeIcon}>
                {type === "writing" && "✎"}
                {type === "project" && "⚙"}
                {type === "hobby" && "♦"}
              </span>
            </div>
          )}
          <div className={styles.tag}>
            <Tag variant={tagVariant}>{type}</Tag>
          </div>
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
