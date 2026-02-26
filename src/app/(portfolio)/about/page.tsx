import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
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
  // MarkdocNode document root; children are block nodes (paragraphs, headings, etc.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bioChildren: any[] = (bioResult as any)?.node?.children ?? [];

  return (
    <div className="section-wrapper">
      <div className={styles.content}>
        <div className="fade-in">
          <p className="section-label">About</p>
          <h1 className="section-title">
            Building the interface layer between people and technology.
          </h1>
          <div className={styles.bio}>
            {bioChildren.map((node: any, i: number) => {
              if (node.type === "paragraph") {
                const text = (node.children ?? [])
                  .map((c: any) => c.attributes?.content ?? c.children?.map((cc: any) => cc.attributes?.content ?? "").join("") ?? "")
                  .join("");
                return <p key={i}>{text}</p>;
              }
              return null;
            })}
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
