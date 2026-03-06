"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useId, useRef } from "react";
import styles from "./Nav.module.css";

type RouteConfig = {
  blog: boolean;
  projects: boolean;
  contact: boolean;
};

type NavProps = {
  enabledRoutes?: RouteConfig;
};

const NAV_LINKS: Array<{
  href: string;
  label: string;
  configKey?: keyof RouteConfig;
}> = [
  { href: "/", label: "home" },
  { href: "/about", label: "about" },
  { href: "/projects", label: "projects", configKey: "projects" },
  { href: "/blog", label: "blog", configKey: "blog" },
  { href: "/contact", label: "contact", configKey: "contact" },
];

export default function Nav({ enabledRoutes }: NavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.configKey || enabledRoutes?.[link.configKey] !== false
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        navRef.current &&
        menuRef.current &&
        !navRef.current.contains(e.target as Node) &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}
        aria-label="Main navigation"
      >
        <Link href="/" className={styles.logo}>
          K<span className={styles.logoAccent}>A.</span>
        </Link>

        <ul className={styles.links}>
          {visibleLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={pathname === href ? styles.active : ""}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className={`${styles.toggle}${mobileOpen ? ` ${styles.toggleOpen}` : ""}`}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={
            mobileOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={mobileOpen}
          aria-controls={menuId}
        >
          <span className={styles.toggleBar} />
          <span className={styles.toggleBar} />
          <span className={styles.toggleBar} />
        </button>
      </nav>

      <div
        ref={menuRef}
        id={menuId}
        className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`}
      >
        <nav aria-label="Mobile navigation">
          <ul>
            {visibleLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={pathname === href ? styles.active : ""}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
