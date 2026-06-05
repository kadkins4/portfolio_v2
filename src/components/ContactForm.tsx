"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./ContactForm.module.css";

type Props = {
  endpoint: string;
};

export default function ContactForm({ endpoint }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Move focus into the form on open; return it to the trigger on close.
  useEffect(() => {
    if (open) {
      nameRef.current?.focus();
    }
  }, [open]);

  // Escape closes the open form.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeForm();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function openForm() {
    setOpen(true);
  }

  function closeForm() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className={styles.wrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerHidden : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        inert={open}
        onClick={openForm}
      >
        Send a message
      </button>

      <div
        id={panelId}
        data-testid="contact-panel"
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        inert={!open}
      >
        <div className={styles.formHeader}>
          <h3 className={styles.formTitle}>Send a message</h3>
          <button
            type="button"
            className={styles.close}
            aria-label="Close form"
            onClick={closeForm}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className={styles.form} action={endpoint} method="POST">
          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            className={styles.honeypot}
          />

          <label className={styles.field}>
            <span className={styles.label}>
              Name <span className={styles.req}>*</span>
            </span>
            <input
              ref={nameRef}
              type="text"
              name="name"
              required
              autoComplete="name"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              Email <span className={styles.opt}>— optional</span>
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              Message <span className={styles.req}>*</span>
            </span>
            <textarea
              name="message"
              required
              rows={4}
              className={styles.textarea}
            />
          </label>

          <p className={styles.hint}>
            No email? Leave another way to reach you in the message.
          </p>

          <button type="submit" className={styles.submit}>
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
