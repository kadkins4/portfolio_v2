import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import HoloFrame from "@/components/holo/HoloFrame";
import HoloReveal from "@/components/holo/HoloReveal";
import ContactForm from "@/components/ContactForm";
import SocialLinks, { type SocialLink } from "@/components/SocialLinks";
import page from "@/components/holo/holoPage.module.css";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Get In Touch",
  description:
    "Reach out to Kendall Adkins about collaborations, freelance work, or roles building web and mobile experiences.",
  alternates: {
    canonical: "/contact",
  },
};

const FORMSPREE_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ??
  "https://formspree.io/f/mqeoeqgb";

export default async function ContactPage() {
  const reader = createReader(process.cwd(), config);
  const [home, settings] = await Promise.all([
    reader.singletons.home.read(),
    reader.singletons.siteSettings.read(),
  ]);

  const name = home?.title ?? "Kendall Adkins";
  const socials: SocialLink[] = (settings?.socialLinks ?? [])
    .filter((link) => link.showInFooter)
    .map((link) => ({
      platform: link.platform,
      url: link.url,
      showInFooter: link.showInFooter,
    }));

  return (
    <HoloFrame name={name}>
      <HoloReveal>
        <div className={`${page.head} ${page.rise}`}>
          <h1 className={page.title}>
            Get In <i>Touch</i>
          </h1>
        </div>

        <div className={`${page.crumb} ${page.rise}`}>
          <span className={page.ps}>
            {name.split(" ")[0].toLowerCase()}@adkins:~$
          </span>{" "}
          ./contact.sh
          <span className={page.cur} aria-hidden="true" />
        </div>

        <p className={`${page.lede} ${page.rise}`}>
          Got a project, a role, or a question? Send a note and I read every
          one. No email is fine... leave another way to reach you and I will
          follow up.
        </p>

        <div className={page.rise}>
          <ContactForm endpoint={FORMSPREE_ENDPOINT} />
        </div>

        {socials.length > 0 && (
          <div className={page.rise}>
            <SocialLinks links={socials} className={styles.socials} />
          </div>
        )}

        <div className={`${page.foot} ${page.rise}`}>
          &gt; connection open
          <span className={page.cur} aria-hidden="true" />
        </div>
      </HoloReveal>
    </HoloFrame>
  );
}
