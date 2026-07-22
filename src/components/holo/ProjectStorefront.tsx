"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import PageShell from "./PageShell";
import ContactDispatch, { type SocialLink } from "./ContactDispatch";
import { districtColor, type District } from "@/lib/district";
import styles from "./projectStorefront.module.css";

export type NextStorefront = {
  slug: string;
  title: string;
  district: District;
};

export default function ProjectStorefront({
  name = "Kendall Adkins",
  slug,
  title,
  district,
  year,
  live,
  image,
  video = null,
  imageFocus = "center",
  blurDataURL,
  tags,
  next,
  socials,
  children,
}: {
  name?: string;
  slug: string;
  title: string;
  district: District;
  year: string;
  live: string | null;
  image: string | null;
  video?: string | null;
  imageFocus?: string;
  blurDataURL?: string;
  tags: string[];
  next: NextStorefront | null;
  socials?: SocialLink[];
  children: ReactNode;
}) {
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  const vars = {
    "--acc": districtColor(district, 0.84),
    "--acc-dim": districtColor(district, 0.8, 0.35),
    "--acc-soft": districtColor(district, 0.82, 0.6),
    "--acc-glow": districtColor(district, 0.75, 0.26),
  } as CSSProperties;

  const nextVars = next
    ? ({
        "--nacc": districtColor(next.district, 0.84),
        "--nacc-dim": districtColor(next.district, 0.8, 0.3),
        "--nacc-glow": districtColor(next.district, 0.75, 0.26),
      } as CSSProperties)
    : undefined;

  return (
    <PageShell active="projects" name={name}>
      <div className={styles.root} style={vars}>
        {/* back + breadcrumb */}
        <div className={styles.crumbRow}>
          <Link href="/projects" className={styles.back}>
            &lt; back to projects
          </Link>
          <span className={styles.crumb}>
            kendall@city:~$ cd projects/{slug}
            <span className={styles.cursor} aria-hidden="true" />
          </span>
        </div>

        {/* title block */}
        <div className={styles.titleBlock}>
          <div className={styles.kicker}>
            ✦ {district.label.toUpperCase()} DISTRICT
          </div>
          <h1 className={styles.h1}>{title}</h1>
          <div className={styles.meta}>
            <span className={styles.pill}>{district.label}</span>
            {year && (
              <span className={styles.pill}>
                <span className={styles.pillDot} aria-hidden="true" />
                {year}
              </span>
            )}
            {live && (
              <a
                href={live}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.livePill}
              >
                &gt; live ↗
              </a>
            )}
          </div>
        </div>

        {/* hero */}
        {(video || image) && (
          <div className={styles.hero}>
            <div className={styles.heroFrame}>
              <span
                className={`${styles.bk} ${styles.tl}`}
                aria-hidden="true"
              />
              <span
                className={`${styles.bk} ${styles.tr}`}
                aria-hidden="true"
              />
              <span
                className={`${styles.bk} ${styles.bl}`}
                aria-hidden="true"
              />
              <span
                className={`${styles.bk} ${styles.br}`}
                aria-hidden="true"
              />
              <div className={styles.heroImgBox}>
                {video ? (
                  <video
                    src={video}
                    poster={image ?? undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.heroVideo}
                    aria-label={`${title} — demo`}
                  />
                ) : (
                  <Image
                    src={image!}
                    alt={`${title} — hero`}
                    fill
                    sizes="(min-width: 1200px) 1100px, 100vw"
                    placeholder={blurDataURL ? "blur" : "empty"}
                    blurDataURL={blurDataURL}
                    style={{ objectPosition: imageFocus }}
                    className={styles.heroImg}
                    priority
                  />
                )}
              </div>
            </div>
            <div className={styles.caption}>
              <span>FIG. 01 · {title.toUpperCase()}</span>
              {!video && (
                <button
                  type="button"
                  className={styles.enlarge}
                  onClick={() => setZoom(true)}
                >
                  ⛶ enlarge
                </button>
              )}
            </div>
          </div>
        )}

        {/* write-up (rendered Markdoc) */}
        <div className={styles.writeup}>{children}</div>

        {/* transfers */}
        {tags.length > 0 && (
          <div className={styles.transfers}>
            <div className={styles.transfersLabel}>TRANSFERS · BUILT WITH</div>
            <div className={styles.transfersChips}>
              {tags.map((t) => (
                <span key={t} className={styles.tchip}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* next storefront */}
        {next && (
          <div className={styles.nextWrap}>
            <Link
              href={`/projects/${next.slug}`}
              className={styles.next}
              style={nextVars}
            >
              <span className={styles.nextStrip} aria-hidden="true" />
              <span>
                <span className={styles.nextKicker}>
                  NEXT STOREFRONT · {next.district.label.toUpperCase()}
                </span>
                <span className={styles.nextTitle}>{next.title}</span>
              </span>
              <span className={styles.nextGo}>keep walking →</span>
            </Link>
          </div>
        )}

        <div className={styles.contactWrap}>
          <ContactDispatch socials={socials} />
        </div>
        <div className={styles.footer}>© 2026 KENDALL ADKINS · NEON CITY</div>
      </div>

      {/* lightbox */}
      {zoom && image && (
        <div
          className={styles.lightbox}
          onClick={() => setZoom(false)}
          role="dialog"
          aria-label={`${title} enlarged`}
        >
          <div
            className={styles.lightboxInner}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={image}
              alt={`${title} — enlarged`}
              fill
              sizes="94vw"
              style={{ objectFit: "contain", objectPosition: imageFocus }}
            />
          </div>
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setZoom(false)}
          >
            ✕ close · esc
          </button>
        </div>
      )}
    </PageShell>
  );
}
