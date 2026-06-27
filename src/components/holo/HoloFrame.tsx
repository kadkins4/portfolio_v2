import styles from "./holo.module.css";
import HoloNav from "./HoloNav";
import ScrollToTop from "./ScrollToTop";

// Shell for inner holo pages: dark frame, scanlines, and the shared primary nav.
export default function HoloFrame({
  children,
  name = "Kendall Adkins",
}: {
  children: React.ReactNode;
  name?: string;
}) {
  return (
    <div className={`${styles.shell} ${styles.play}`}>
      <HoloNav name={name} />
      {children}
      <ScrollToTop />
    </div>
  );
}
