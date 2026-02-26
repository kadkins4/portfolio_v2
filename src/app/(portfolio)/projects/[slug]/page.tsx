import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../../keystatic.config";
import styles from "./page.module.css";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const reader = createReader(process.cwd(), config);
  const slugs = await reader.collections.projects.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const reader = createReader(process.cwd(), config);
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
  const reader = createReader(process.cwd(), config);
  const project = await reader.collections.projects.read(slug);
  if (!project) notFound();

  // Render markdoc content as simple paragraphs
  const contentResult = await project.content();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentNodes: any[] = (contentResult as unknown as any)?.node?.children ?? [];

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
        {contentNodes.map((node: any, i: number) => {
          if (node.type === "paragraph") {
            const text = (node.children ?? [])
              .map((c: any) => c.attributes?.content ?? c.children?.map((cc: any) => cc.attributes?.content ?? "").join("") ?? "")
              .join("");
            return <p key={i}>{text}</p>;
          }
          if (node.type === "heading") {
            const text = (node.children ?? [])
              .map((c: any) => c.attributes?.content ?? c.children?.map((cc: any) => cc.attributes?.content ?? "").join("") ?? "")
              .join("");
            return <h2 key={i}>{text}</h2>;
          }
          return null;
        })}
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
