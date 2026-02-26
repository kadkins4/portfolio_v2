import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import ProjectCard from "@/components/ProjectCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected frontend engineering work — design systems, performance optimization, and more.",
};

export default async function ProjectsPage() {
  const reader = createReader(process.cwd(), config);
  const projects = await reader.collections.projects.all();

  const sorted = [...projects].sort((a, b) => {
    const dateA = a.entry.date ? new Date(a.entry.date).getTime() : 0;
    const dateB = b.entry.date ? new Date(b.entry.date).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="section-wrapper">
      <div className="fade-in">
        <p className="section-label">Projects</p>
        <h1 className="section-title">Selected work.</h1>
      </div>
      <div className={styles.grid}>
        {sorted.map((project, i) => (
          <div key={project.slug} className="fade-in">
            <ProjectCard
              slug={project.slug}
              title={project.entry.title}
              description={project.entry.description}
              tags={[...project.entry.tags]}
              coverImage={project.entry.coverImage ?? null}
              index={i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
