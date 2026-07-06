"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import styles from "./siteHeader.module.css";

// Shared sticky header for every content page: wordmark + projects/resume/about
// nav (active one lit), plus the ⌂ home icon and "> get in touch" pills.
// "get in touch" smooth-scrolls to the in-page contact dispatch (#contact-anchor),
// falling back to the /contact route when there's no dispatch on the page.
export default function SiteHeader({
  active,
  name = "Kendall Adkins",
}: {
  active?: "projects" | "resume" | "about";
  name?: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");

  function goContact(e: MouseEvent) {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.getElementById("contact-anchor");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      router.push("/contact");
    }
  }

  return (
    <>
      <header className={styles.header}>
        <Link
          href="/"
          className={styles.brand}
          onClick={() => setMenuOpen(false)}
        >
          {first} {last && <i>{last}</i>}
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${
                active === item.label ? styles.navActive : ""
              }`}
              aria-current={active === item.label ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <span className={styles.spacer} />

        <Link
          href="/"
          aria-label="Home"
          title="Home"
          className={`${styles.pill} ${styles.pillNeutral} ${styles.pillIcon} ${styles.deskOnly}`}
        >
          ⌂
        </Link>
        <a
          href="/contact"
          onClick={goContact}
          className={`${styles.pill} ${styles.pillGreen} ${styles.deskOnly}`}
        >
          &gt; get in touch
        </a>

        <button
          type="button"
          className={styles.burger}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <div className={styles.menu}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.menuLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className={styles.menuLink}
            onClick={() => setMenuOpen(false)}
          >
            ⌂ home
          </Link>
          <a href="/contact" onClick={goContact} className={styles.menuLink}>
            &gt; get in touch
          </a>
        </div>
      )}
    </>
  );
}
