import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../keystatic.config";
import Tag from "@/components/Tag";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Kendall Adkins - skills, hobbies, and background.",
};

export default async function AboutPage() {
  const reader = createReader(process.cwd(), config);
  const about = await reader.singletons.about.read();
  const bioResult = about ? await about.bio() : null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About</h1>

      {bioResult && (
        <div className={styles.bio}>{renderMarkdoc(bioResult)}</div>
      )}

      {about?.skills && about.skills.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.tags}>
            {about.skills.map((skill) => (
              <Tag key={skill} variant="skill">
                {skill}
              </Tag>
            ))}
          </div>
        </section>
      )}

      {about?.hobbies && about.hobbies.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hobbies</h2>
          <div className={styles.tags}>
            {about.hobbies.map((hobby) => (
              <Tag key={hobby} variant="hobby">
                {hobby}
              </Tag>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
