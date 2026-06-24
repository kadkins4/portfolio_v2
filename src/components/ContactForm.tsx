"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import styles from "./ContactForm.module.css";

type Props = {
  endpoint: string;
};

type Status = "idle" | "sending" | "error";

export default function ContactForm({ endpoint }: Props) {
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [invalid, setInvalid] = useState(false);
  const [name, setName] = useState("");
  const formId = useId();
  const receiptRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const nm = String(data.get("name") ?? "").trim();
    const msg = String(data.get("message") ?? "").trim();

    if (!nm || !msg) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setName(nm);
        setSent(true);
        requestAnimationFrame(() => receiptRef.current?.focus());
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setSent(false);
    setStatus("idle");
    setInvalid(false);
    setName("");
  }

  const receipt = `$ ./contact.sh --send
  to:   kendall@adkins
  from: ${name || "anon"}
  ok:   queued for delivery

Thanks, I'll be in touch soon.`;

  return (
    <div className={styles.card}>
      <div className={styles.scan} aria-hidden="true" />
      <span className={styles.bkTL} aria-hidden="true" />
      <span className={styles.bkBR} aria-hidden="true" />

      {sent ? (
        <div
          className={styles.receipt}
          ref={receiptRef}
          tabIndex={-1}
          role="status"
        >
          <div className={styles.sentHead}>
            <span className={styles.sentDot} aria-hidden="true" />
            MESSAGE SENT · EXIT 0
          </div>
          <pre className={styles.pre}>{receipt}</pre>
          <button type="button" className={styles.again} onClick={reset}>
            &gt; send another
          </button>
        </div>
      ) : (
        <form
          id={formId}
          data-testid="contact-form"
          className={styles.body}
          action={endpoint}
          method="POST"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={styles.heading}>&gt; compose --message</div>

          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            className={styles.honeypot}
          />

          <div className={styles.row2}>
            <div>
              <label className={styles.label} htmlFor={`${formId}-name`}>
                NAME
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                name="name"
                autoComplete="name"
                placeholder="your name"
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor={`${formId}-email`}>
                EMAIL / HANDLE
              </label>
              <input
                id={`${formId}-email`}
                type="text"
                name="email"
                autoComplete="email"
                placeholder="how to reach you"
                className={styles.input}
              />
            </div>
          </div>

          <label className={styles.label} htmlFor={`${formId}-msg`}>
            MESSAGE
          </label>
          <textarea
            id={`${formId}-msg`}
            name="message"
            rows={4}
            placeholder="what's on your mind?"
            className={styles.textarea}
          />

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.send}
              disabled={status === "sending"}
            >
              {status === "sending" ? "> sending…" : "> send_message"}
            </button>
            {invalid && (
              <span className={styles.err} role="alert">
                ! name + message required
              </span>
            )}
            {status === "error" && (
              <span className={styles.err} role="alert">
                ! send failed, try the channels at right
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
