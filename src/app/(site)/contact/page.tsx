import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import HoloFrame from "@/components/holo/HoloFrame";
import TypedReveal from "@/components/holo/TypedReveal";
import ContactForm from "@/components/ContactForm";
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

const SOCIAL_GLYPH: Record<string, string> = {
  github: "{ }",
  linkedin: "in",
  instagram: "[o]",
};
const SOCIAL_LABEL: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
};

export default async function ContactPage() {
  const reader = createReader(process.cwd(), config);
  const [home, settings] = await Promise.all([
    reader.singletons.home.read(),
    reader.singletons.siteSettings.read(),
  ]);

  const name = home?.title ?? "Kendall Adkins";
  const socials = (settings?.socialLinks ?? []).filter((l) => l.showInFooter);

  return (
    <HoloFrame name={name}>
      <TypedReveal
        wide
        name={name}
        backHref="/"
        backLabel="back to home"
        head={
          <div className={page.head}>
            <h1 className={page.title}>
              Get In <i>Touch</i>
            </h1>
            <span className={page.entries}>
              <span className={page.dot} aria-hidden="true" />
              CONNECTION OPEN
            </span>
          </div>
        }
        steps={[
          { kind: "command", text: "./contact.sh" },
          {
            kind: "reveal",
            node: (
              <>
                <p className={page.lede} data-rise>
                  Got a project, a role, or a question? Send a note and I read
                  every one. No email handy? Drop another way to reach you and
                  I&rsquo;ll follow up.
                </p>

                <div className={styles.grid} data-rise>
                  <ContactForm endpoint={FORMSPREE_ENDPOINT} />

                  <div className={styles.channels}>
                    <div className={styles.scan} aria-hidden="true" />
                    <div className={styles.inner}>
                      <div className={styles.heading}>
                        &gt; direct --channels
                      </div>

                      {socials.length > 0 && (
                        <>
                          <div className={styles.sockets}>SOCKETS</div>
                          <div className={styles.socketList}>
                            {socials.map((s) => (
                              <a
                                key={s.platform}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.row}
                              >
                                <span
                                  className={styles.glyph}
                                  aria-hidden="true"
                                >
                                  {SOCIAL_GLYPH[s.platform] ?? "·"}
                                </span>
                                <span
                                  className={styles.metaValue}
                                  style={{ flex: 1 }}
                                >
                                  {SOCIAL_LABEL[s.platform] ?? s.platform}
                                </span>
                                <span
                                  className={styles.arrow}
                                  aria-hidden="true"
                                >
                                  ↗
                                </span>
                              </a>
                            ))}
                          </div>
                        </>
                      )}

                      <div className={styles.replies}>
                        <span
                          className={styles.repliesDot}
                          aria-hidden="true"
                        />
                        USUALLY REPLIES WITHIN 24H
                      </div>
                    </div>
                  </div>
                </div>

                <div className={page.foot} data-rise>
                  &gt; connection open · awaiting input
                  <span className={page.cur} aria-hidden="true" />
                </div>
              </>
            ),
          },
        ]}
      />
    </HoloFrame>
  );
}
