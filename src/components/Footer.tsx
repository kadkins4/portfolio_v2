import { createReader } from "@keystatic/core/reader";
import config from "../../keystatic.config";
import SocialLinks from "./SocialLinks";

const CURRENT_YEAR = new Date().getFullYear();

export default async function Footer() {
  const reader = createReader(process.cwd(), config);
  const settings = await reader.singletons.siteSettings.read();
  const links = (settings?.socialLinks ?? []).filter((l) => l.showInFooter);

  return (
    <footer className="footer-wrapper">
      <SocialLinks links={links} className="footer-links-nav" />
    </footer>
  );
}
