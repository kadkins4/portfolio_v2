"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoK}>K</span>
        <span className={styles.logoA}>A.</span>
      </Link>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link
          href="/about"
          className={`${styles.navLink} ${pathname === "/about" ? styles.active : ""}`}
        >
          About
        </Link>
        <Link
          href="/projects"
          className={`${styles.navLink} ${pathname.startsWith("/projects") ? styles.active : ""}`}
        >
          Projects
        </Link>
      </nav>
    </header>
  );
}
