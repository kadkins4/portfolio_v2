import type { Metadata } from "next";
import Image from "next/image";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../keystatic.config";
import Tag from "@/components/Tag";
import SocialLinks from "@/components/SocialLinks";
import ContactForm from "@/components/ContactForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Kendall Adkins - skills, background, and interests.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About",
    description:
      "Learn more about Kendall Adkins - skills, background, and interests.",
  },
};

export default async function AboutPage() {
  const reader = createReader(process.cwd(), config);
  const about = await reader.singletons.about.read();

  const whatIDoResult = about ? await about.whatIDo() : null;
  const howIGotHereResult = about ? await about.howIGotHere() : null;
  const outsideOfCodeResult = about ? await about.outsideOfCode() : null;

  const settings = await reader.singletons.siteSettings.read();
  const socialLinks = (settings?.socialLinks ?? []).filter(
    (l) => l.showInFooter
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Image
            src="/images/kendall-adkins.jpeg"
            alt="Kendall Adkins"
            width={96}
            height={96}
            priority
            className={styles.portrait}
          />
          <h1 className={styles.title}>About</h1>
        </div>
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

      {whatIDoResult && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What I Do</h2>
          <div className={styles.bio}>{renderMarkdoc(whatIDoResult)}</div>
        </section>
      )}

      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Want to work together?</h2>
        <p className={styles.ctaText}>
          I take on select freelance projects that I find interesting and
          exciting. If you have something in mind, I&apos;d love to hear about
          it.
        </p>
        {process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT && (
          <ContactForm endpoint={process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT} />
        )}
        <div className={styles.ctaDivider}>or find me on</div>
        <SocialLinks links={socialLinks} className={styles.ctaSocials} />
      </section>

      {howIGotHereResult && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How I Got Here</h2>
          <div className={styles.bio}>{renderMarkdoc(howIGotHereResult)}</div>
        </section>
      )}

      {outsideOfCodeResult && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Outside of Code</h2>
          <div className={styles.bio}>{renderMarkdoc(outsideOfCodeResult)}</div>
        </section>
      )}
    </div>
  );
}
