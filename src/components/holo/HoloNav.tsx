"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import styles from "./holo.module.css";

// The one-and-only primary nav: brand (→ home) + links + mobile burger/drawer.
// Used by both HoloFrame (inner pages) and Gateway (home) so the nav is
// identical everywhere. Links come from NAV_ITEMS (single source of truth).
export default function HoloNav({
  name = "Kendall Adkins",
}: {
  name?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");

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
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

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
        </div>
      )}
    </>
  );
}
