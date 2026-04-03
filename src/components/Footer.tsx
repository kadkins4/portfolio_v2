import { createReader } from "@keystatic/core/reader";
import config from "../../keystatic.config";
import SocialLinks from "./SocialLinks";
import styles from "./Footer.module.css";

export default async function Footer() {
  const reader = createReader(process.cwd(), config);
  const settings = await reader.singletons.siteSettings.read();
  const links = (settings?.socialLinks ?? []).filter((l) => l.showInFooter);

  return (
    <footer className={styles.footer}>
      <SocialLinks links={links} className={styles.links} />
    </footer>
  );
}
