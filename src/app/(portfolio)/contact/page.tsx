import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import SocialLinks from "@/components/SocialLinks";
import ContactForm from "./ContactForm";
import styles from "./page.module.css";

export default async function ContactPage() {
  const reader = createReader(process.cwd(), config);
  const settings = await reader.singletons.siteSettings.read();
  const links = (settings?.socialLinks ?? []).filter((l) => l.showInContact);

  return (
    <div className="section-wrapper">
      <p className="section-label">Contact</p>
      <h1 className="section-title">Get in touch.</h1>
      <SocialLinks links={links} className={styles.socialLinks} />
      <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
        Have a project in mind or just want to say hello? I&#39;d love to hear from you.
      </p>
      <ContactForm />
    </div>
  );
}
