import Link from "next/link";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import styles from "./page.module.css";

export default async function HomePage() {
  const reader = createReader(process.cwd(), config);
  const home = await reader.singletons.home.read();

  return (
    <section className={styles.hero}>
      <div className={styles.logo}>KA</div>
      <h1 className={styles.title}>{home?.title ?? "Kendall Adkins"}</h1>
      <p className={styles.tagline}>
        {home?.tagline ?? "Senior Software Engineer"}
      </p>
      <nav className={styles.nav}>
        <Link href="/about" className={styles.navLink}>
          About
        </Link>
        <Link href="/work" className={styles.navLink}>
          Work
        </Link>
      </nav>
    </section>
  );
}
