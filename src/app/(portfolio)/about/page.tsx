import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../keystatic.config";
import Tag from "@/components/Tag";
import SocialLinks from "@/components/SocialLinks";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Kendall Adkins - skills, hobbies, and background.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About",
    description:
      "Learn more about Kendall Adkins - skills, hobbies, and background.",
  },
};

export default async function AboutPage() {
  const reader = createReader(process.cwd(), config);
  const about = await reader.singletons.about.read();
  const bioResult = about ? await about.bio() : null;
  const settings = await reader.singletons.siteSettings.read();
  const socialLinks = (settings?.socialLinks ?? []).filter(
    (l) => l.showInFooter
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>About</h1>
        <a
          href="/kendall-adkins-resume.pdf"
          download
          className={styles.resumeLink}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Resume
        </a>
      </div>

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

      {about?.strengths && about.strengths.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How I Work</h2>
          <div className={styles.tags}>
            {about.strengths.map((strength) => (
              <Tag key={strength} variant="strength">
                {strength}
              </Tag>
            ))}
          </div>
        </section>
      )}

      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Want to work together?</h2>
        <p className={styles.ctaText}>
          I take on select freelance projects that I find interesting and
          exciting. If you have something in mind, I&apos;d love to hear about
          it.
        </p>
        <SocialLinks links={socialLinks} className={styles.ctaSocials} />
      </section>
    </div>
  );
}
