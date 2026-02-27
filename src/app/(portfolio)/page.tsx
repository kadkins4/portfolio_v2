import type { Metadata } from "next";
import Link from "next/link";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Kendall Adkins — Senior Front End Engineer",
  description:
    "Senior Front End Engineer crafting performant, accessible, and visually refined interfaces for the modern web.",
};

export default async function HomePage() {
  const reader = createReader(process.cwd(), config);
  const home = await reader.singletons.home.read();

  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.glow} aria-hidden="true" />
      <Link href="/contact" className={styles.badge}>
        <span className={styles.badgeDot} aria-hidden="true" />
        {home?.badge ?? "Available for work"}
      </Link>
      <h1 className={styles.heading}>
        Kendall<br />
        <span className={styles.gradient}>Adkins</span>
      </h1>
      <p className={styles.sub}>
        {home?.subheading ?? "Senior Front End Engineer crafting performant, accessible, and visually refined interfaces for the modern web."}
      </p>
      <div className={styles.cta}>
        <Link href="/projects" className={styles.btnPrimary}>View Projects</Link>
        <Link href="/about" className={styles.btnGhost}>About Me</Link>
      </div>
    </section>
  );
}
