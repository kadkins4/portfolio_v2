"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./holo.module.css";
import HoloNav from "./HoloNav";

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

export type GatewayProps = {
  name: string;
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

export default function Gateway({ name, craft, life }: GatewayProps) {
  const reduced = usePrefersReducedMotion();
  const [bootDone, setBootDone] = useState(false);

  // Reduced motion is handled by deriving `booting` below rather than by
  // setting state here, so the boot screen never paints for a frame first.
  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setBootDone(true), 1080);
    return () => clearTimeout(t);
  }, [reduced]);

  const booting = !bootDone && !reduced;

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

      <HoloNav name={name} />

      <main className={styles.gateway}>
        <Panel kind="craft" eyebrow="✦ THE CRAFT" side={craft} />
        <Panel kind="life" eyebrow="✦ THE LIFE" side={life} />
      </main>
    </div>
  );
}
