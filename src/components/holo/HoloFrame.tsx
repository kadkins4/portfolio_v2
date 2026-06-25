import Link from "next/link";
import styles from "./holo.module.css";

// Chrome-free shell for inner holo pages: dark frame, scanlines, and a nav band
// with the brand and a "back to terminal" link (matches the prototype inner pages).
export default function HoloFrame({
  children,
  name = "Kendall Adkins",
}: {
  children: React.ReactNode;
  name?: string;
}) {
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");

  return (
    <div className={`${styles.shell} ${styles.play}`}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          {first} {last && <i>{last}</i>}
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/story" className={styles.navLink}>
            About
          </Link>
          <Link href="/notes" className={styles.navLink}>
            Notes
          </Link>
          <Link href="/contact" className={styles.navLink}>
            Contact
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
