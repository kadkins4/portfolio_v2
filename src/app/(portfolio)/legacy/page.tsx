import type { Metadata } from "next";
import Link from "next/link";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import { SITE_DESCRIPTION } from "@/lib/constants";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Legacy Home",
  description: SITE_DESCRIPTION,
  robots: { index: false, follow: false },
};

// Archived copy of the original home page, preserved during the Holo-Terminal
// redesign. Reachable at /legacy; the live home is being replaced by the new shell.
export default async function LegacyHomePage() {
  const reader = createReader(process.cwd(), config);
  const home = await reader.singletons.home.read();

  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>{home?.title ?? "Kendall Adkins"}</h1>
      <p className={styles.tagline}>{home?.tagline ?? "Software Engineer"}</p>
      {home?.intro && <p className={styles.intro}>{home.intro}</p>}
      <nav className={styles.nav}>
        <Link href="/about" className={styles.navLink}>
          About
        </Link>
        <span className={styles.separator} aria-hidden="true" />
        <Link href="/studio" className={styles.navLink}>
          Studio
        </Link>
      </nav>
    </section>
  );
}
