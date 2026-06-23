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
        <Link href="/" className={styles.backLink}>
          ← cd ~/terminal
        </Link>
      </header>
      {children}
    </div>
  );
}
