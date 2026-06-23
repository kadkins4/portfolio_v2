"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./holo.module.css";

export type GatewayDir = {
  name: string;
  desc: string;
  meta: string;
  href: string;
  external?: boolean;
  preview: string;
};

export type GatewaySide = {
  title: string;
  emphasizeLast?: boolean;
  subtitle: string;
  dirs: GatewayDir[];
};

export type NavItem = { label: string; href: string };

export type GatewayProps = {
  name: string;
  nav: NavItem[];
  craft: GatewaySide;
  life: GatewaySide;
};

function TitleText({
  title,
  emphasizeLast,
}: {
  title: string;
  emphasizeLast?: boolean;
}) {
  if (!emphasizeLast) return <>{title}</>;
  const parts = title.split(" ");
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <span className={styles.titleEm}>{last}</span>
    </>
  );
}

function DirRow({
  dir,
  onHover,
}: {
  dir: GatewayDir;
  onHover: (preview: string | null) => void;
}) {
  const content = (
    <>
      <span className={styles.name}>{dir.name}</span>
      <span className={styles.desc}>{dir.desc}</span>
      <span className={styles.meta} aria-hidden="true">
        {dir.meta}
      </span>
    </>
  );
  const shared = {
    className: styles.dir,
    onMouseEnter: () => onHover(dir.preview),
    onFocus: () => onHover(dir.preview),
    onMouseLeave: () => onHover(null),
    onBlur: () => onHover(null),
  };
  if (dir.external) {
    return (
      <a href={dir.href} {...shared}>
        {content}
      </a>
    );
  }
  return (
    <Link href={dir.href} {...shared}>
      {content}
    </Link>
  );
}

function Panel({
  kind,
  eyebrow,
  side,
}: {
  kind: "craft" | "life";
  eyebrow: string;
  side: GatewaySide;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <section className={`${styles.panel} ${styles[kind]}`}>
      <span className={`${styles.bracket} ${styles.bracketTL}`} aria-hidden />
      <span className={`${styles.bracket} ${styles.bracketTR}`} aria-hidden />
      <span className={`${styles.bracket} ${styles.bracketBL}`} aria-hidden />
      <span className={`${styles.bracket} ${styles.bracketBR}`} aria-hidden />

      <div className={styles.eyebrow}>
        <span>{eyebrow}</span>
        <span className={styles.online}>
          <span className={styles.dot} aria-hidden="true" />
          ONLINE
        </span>
      </div>
      <h2 className={styles.title}>
        <TitleText title={side.title} emphasizeLast={side.emphasizeLast} />
      </h2>
      <p className={styles.subtitle}>{side.subtitle}</p>
      <div className={styles.selectLabel}>~/ SELECT A DIRECTORY</div>
      <nav className={styles.dirs}>
        {side.dirs.map((d) => (
          <DirRow key={d.name} dir={d} onHover={setPreview} />
        ))}
      </nav>

      <div className={styles.previewWrap}>
        <div className={styles.divider} />
        <div className={styles.previewLine}>
          {preview ? (
            <span className={styles.pv}>{preview}</span>
          ) : (
            "// hover a directory to preview ↑"
          )}
        </div>
        <div className={styles.enter}>
          &gt; enter
          <span className={styles.caret} aria-hidden="true">
            _
          </span>
        </div>
      </div>
    </section>
  );
}

export default function Gateway({ name, nav, craft, life }: GatewayProps) {
  const [booting, setBooting] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setBooting(false);
      return;
    }
    const t = setTimeout(() => setBooting(false), 1080);
    return () => clearTimeout(t);
  }, []);

  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");

  return (
    <div className={`${styles.shell} ${booting ? "" : styles.play}`}>
      {booting && (
        <div className={styles.boot} aria-hidden="true">
          <div className={styles.bootScreen} />
          <div className={styles.bootText}>
            &gt; booting kendall.os<span className={styles.caret}>_</span>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <Link
          href="/"
          className={styles.brand}
          onClick={() => setMenuOpen(false)}
        >
          {first} {last && <i>{last}</i>}
        </Link>

        <nav className={styles.nav}>
          {nav.map((item) => (
            <Link key={item.label} href={item.href} className={styles.navLink}>
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
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={styles.menuLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <main className={styles.gateway}>
        <Panel kind="craft" eyebrow="✦ THE CRAFT" side={craft} />
        <Panel kind="life" eyebrow="✦ THE LIFE" side={life} />
      </main>
    </div>
  );
}
