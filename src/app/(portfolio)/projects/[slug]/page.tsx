import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../../keystatic.config";
import styles from "./page.module.css";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ slug: string }> };

const reader = createReader(process.cwd(), config);

export async function generateStaticParams() {
  const slugs = await reader.collections.projects.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await reader.collections.projects.read(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.coverImage ? [project.coverImage] : [],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await reader.collections.projects.read(slug);
  if (!project) notFound();

  const contentResult = await project.content();

  return (
    <div className="section-wrapper">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description: project.description,
        author: { "@type": "Person", name: "Kendall Adkins" },
        image: project.coverImage ?? undefined,
        url: project.liveUrl ?? undefined,
      }} />
      <div className={styles.header}>
        <p className="section-label">Project</p>
        <h1 className="section-title">{project.title}</h1>
        <div className={styles.tags}>
          {[...project.tags].map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>

      {project.coverImage && (
        <Image
          src={project.coverImage}
          alt={`${project.title} preview`}
          width={900}
          height={500}
          className={styles.coverImage}
          priority
        />
      )}

      <div className={styles.content}>
        {renderMarkdoc(contentResult)}
      </div>

      <div className={styles.links}>
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
            Live Site
          </a>
        )}
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>
            View Code
          </a>
        )}
      </div>
    </div>
  );
}
