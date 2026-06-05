"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import styles from "./ContactForm.module.css";

type Props = {
  endpoint: string;
};

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm({ endpoint }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  function openForm() {
    setOpen(true);
  }

  function closeForm() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeForm();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
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

        {status === "success" ? (
          <p className={styles.success} role="status">
            Thanks — I&apos;ll be in touch soon.
          </p>
        ) : (
          <form
            data-testid="contact-form"
            className={styles.form}
            action={endpoint}
            method="POST"
            onSubmit={handleSubmit}
          >
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

            {status === "error" && (
              <p className={styles.error} role="alert">
                Something went wrong — please try again or reach me on the links
                below.
              </p>
            )}

            <button
              type="submit"
              className={styles.submit}
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
