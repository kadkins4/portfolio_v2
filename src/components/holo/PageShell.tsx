import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import styles from "./pageShell.module.css";

// The shared page frame: dark grid background + fixed scanline overlay + the
// sticky SiteHeader + a centered 1200px content column. Every content page
// (Projects, Resume, About, project detail) wraps its body in this.
export default function PageShell({
  children,
  active,
  name,
}: {
  children: ReactNode;
  active?: "projects" | "resume" | "about";
  name?: string;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.scan} aria-hidden="true" />
      <SiteHeader active={active} name={name} />
      <div className={styles.container}>{children}</div>
    </div>
  );
}
