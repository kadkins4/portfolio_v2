import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../keystatic.config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Senior Front End Engineer with a deep focus on design systems, performance optimization, and accessibility.",
};

export default async function AboutPage() {
  const reader = createReader(process.cwd(), config);
  const about = await reader.singletons.about.read();
  const bioResult = about ? await about.bio() : null;

  return (
    <div className="section-wrapper">
      <div className={styles.content}>
        <div className="fade-in">
          <p className="section-label">About</p>
          <h1 className="section-title">
            Building the interface layer between people and technology.
          </h1>
          <div className={styles.bio}>
            {bioResult ? renderMarkdoc(bioResult) : null}
          </div>
        </div>

        <div className="fade-in">
          <p className="section-label">Expertise</p>
          <ul className={styles.skillsGrid} aria-label="Technical skills">
            {(about?.skills ?? []).map((skill) => (
              <li key={skill} className={styles.skillItem}>
                <span className={styles.skillDot} aria-hidden="true" />
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
