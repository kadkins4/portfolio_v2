import type { Metadata } from "next";
import Link from "next/link";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Kendall Adkins — Senior Software Engineer building performant, accessible, and visually refined interfaces for the modern web.",
  openGraph: {
    title: "Kendall Adkins — Senior Software Engineer",
    description:
      "Building performant, accessible, and visually refined interfaces for the modern web.",
  },
};

export default async function HomePage() {
  const reader = createReader(process.cwd(), config);
  const home = await reader.singletons.home.read();

  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>{home?.title ?? "Kendall Adkins"}</h1>
      <p className={styles.tagline}>
        {home?.tagline ?? "Senior Software Engineer"}
      </p>
      <nav className={styles.nav}>
        <Link href="/about" className={styles.navLink}>
          About
        </Link>
        <span className={styles.separator} aria-hidden="true" />
        <Link href="/work" className={styles.navLink}>
          Work
        </Link>
      </nav>
    </section>
  );
}
