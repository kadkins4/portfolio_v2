import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../../keystatic.config";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";
import HoloFrame from "@/components/holo/HoloFrame";
import HoloReveal from "@/components/holo/HoloReveal";
import page from "@/components/holo/holoPage.module.css";
import styles from "./project.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

const getReader = cache(() => createReader(process.cwd(), config));

export async function generateStaticParams() {
  const reader = getReader();
  const items = await reader.collections.projects.all();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const reader = getReader();
  const { slug } = await params;
  const item = await reader.collections.projects.read(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.description,
    alternates: {
      canonical: `/projects/${slug}`,
    },
    openGraph: {
      title: item.title,
      description: item.description,
      type: "article",
      images: item.image ? [item.image] : [],
    },
  };
}

function yearOf(date: string | null): string {
  if (!date) return "";
  const y = date.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : "";
}

export default async function ProjectDetailPage({ params }: Props) {
  const reader = getReader();
  const { slug } = await params;
  const [item, home] = await Promise.all([
    reader.collections.projects.read(slug),
    reader.singletons.home.read(),
  ]);

  if (!item) {
    notFound();
  }

  const name = home?.title ?? "Kendall Adkins";
  const contentResult = await item.content();
  const year = yearOf(item.date ?? null);
  const tags = item.tags ?? [];

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
        name: "Selected Work",
        item: `${SITE_URL}/work`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: `${SITE_URL}/projects/${slug}`,
      },
    ],
  };

  return (
    <HoloFrame name={name}>
      <JsonLd data={breadcrumbSchema} />
      <HoloReveal>
        <div className={`${page.head} ${page.rise}`}>
          <h1 className={page.title}>{item.title}</h1>
          <span className={page.entries}>
            <span className={page.dot} aria-hidden="true" />
            {[year, "PROJECT"].filter(Boolean).join(" · ")}
          </span>
        </div>

        <div className={`${page.crumb} ${page.rise}`}>
          <span className={page.ps}>
            {name.split(" ")[0].toLowerCase()}@adkins:~$
          </span>{" "}
          cat work/{slug}.md
          <span className={page.cur} aria-hidden="true" />
        </div>

        {item.description && (
          <p className={`${page.lede} ${page.rise}`}>{item.description}</p>
        )}

        {tags.length > 0 && (
          <div className={`${page.chips} ${page.rise}`}>
            {tags.map((tag: string) => (
              <span key={tag} className={page.chip}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {item.image && (
          <div className={`${styles.shot} ${page.rise}`}>
            <Image
              src={item.image}
              alt={`${item.title} featured image`}
              width={1200}
              height={675}
              className={styles.img}
              style={{ objectPosition: item.imageFocus ?? "center" }}
              priority
            />
            <span className={styles.sl} aria-hidden="true" />
            <span className={`${styles.bk} ${styles.tl}`} aria-hidden="true" />
            <span className={`${styles.bk} ${styles.br}`} aria-hidden="true" />
          </div>
        )}

        {contentResult && (
          <div className={`${page.prose} ${page.rise}`}>
            {renderMarkdoc(contentResult)}
          </div>
        )}

        {item.externalUrl && (
          <div className={page.rise}>
            <a
              href={item.externalUrl}
              className={page.cta}
              target="_blank"
              rel="noopener noreferrer"
            >
              view live ↗
            </a>
          </div>
        )}

        <div className={page.rise}>
          <Link href="/work" className={styles.back}>
            ← cd work/
          </Link>
        </div>

        <div className={`${page.foot} ${page.rise}`}>
          &gt; eof
          <span className={page.cur} aria-hidden="true" />
        </div>
      </HoloReveal>
    </HoloFrame>
  );
}
