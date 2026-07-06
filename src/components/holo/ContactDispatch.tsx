"use client";

import { useState, type CSSProperties } from "react";
import ContactForm from "../ContactForm";
import styles from "./contactDispatch.module.css";

export type SocialLink = { platform: string; url: string };

const FORMSPREE_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ??
  "https://formspree.io/f/mqeoeqgb";

const SOCIAL_META: Record<
  string,
  { glyph: string; label: string; color: string }
> = {
  github: { glyph: "{ }", label: "github", color: "var(--cyan)" },
  linkedin: { glyph: "in", label: "linkedin", color: "var(--pink)" },
  instagram: { glyph: "[o]", label: "instagram", color: "var(--amber)" },
};

// Shared "Post Office" contact block, dropped at the foot of every page.
// Collapsed it's a summon strip; clicking CRT-boots the dispatch desk, which
// wraps the existing ContactForm (Formspree) plus social "sockets".
// Sockets come straight from the CMS — no entry, no socket (no fallback).
export default function ContactDispatch({
  socials,
  endpoint = FORMSPREE_ENDPOINT,
  startOpen = false,
}: {
  socials?: SocialLink[];
  endpoint?: string;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(startOpen);
  const links = (socials ?? []).filter((s) => SOCIAL_META[s.platform]);

  return (
    <div id="contact-anchor" className={styles.anchor}>
      {open ? (
        <div className={styles.desk}>
          <span
            className={`${styles.bracket} ${styles.tl}`}
            aria-hidden="true"
          />
          <span
            className={`${styles.bracket} ${styles.tr}`}
            aria-hidden="true"
          />
          <span
            className={`${styles.bracket} ${styles.bl}`}
            aria-hidden="true"
          />
          <span
            className={`${styles.bracket} ${styles.br}`}
            aria-hidden="true"
          />
          <div className={styles.scan} aria-hidden="true" />

          <button
            type="button"
            className={styles.minimize}
            onClick={() => setOpen(false)}
          >
            ▁ minimize
          </button>

          <div className={styles.head}>
            <div className={styles.kicker}>
              <span>✦ NEON CITY POST OFFICE</span>
              <span className={styles.dim}>DISPATCH DESK</span>
            </div>
            <h2 className={styles.title}>
              Drop a <i>letter</i>
            </h2>
            <p className={styles.blurb}>
              A role, a project, or a good reason to say hi. The desk is always
              staffed.
            </p>
          </div>

          <ContactForm endpoint={endpoint} />

          {links.length > 0 && (
            <div className={styles.sockets}>
              <span className={styles.socketsLabel}>SOCKETS</span>
              {links.map((s) => {
                const meta = SOCIAL_META[s.platform];
                return (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socket}
                    style={{ "--sock": meta.color } as CSSProperties}
                  >
                    <span>{meta.glyph}</span>
                    <span>{meta.label}</span>
                    <span className={styles.up}>↗</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className={styles.summon}
          onClick={() => setOpen(true)}
        >
          <span
            className={`${styles.bracket} ${styles.tl}`}
            aria-hidden="true"
          />
          <span
            className={`${styles.bracket} ${styles.br}`}
            aria-hidden="true"
          />
          <span className={styles.summonKicker}>✦ POST OFFICE · BRANCH 02</span>
          <span className={styles.summonCta}>
            &gt; open dispatch desk
            <span className={styles.cursor} aria-hidden="true" />
          </span>
          <span className={styles.summonStatus}>
            <span className={styles.statusDot} aria-hidden="true" />
            REPLIES WITHIN 24H
          </span>
        </button>
      )}
    </div>
  );
}
