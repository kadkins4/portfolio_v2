"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="section-wrapper">
      <p className="section-label">Contact</p>
      <h1 className="section-title">Get in touch.</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
        Have a project in mind or just want to say hello? I&#39;d love to hear from you.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Honeypot — hidden from real users */}
        <input
          type="text"
          name="website"
          className={styles.honeypot}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={styles.input}
            autoComplete="name"
            aria-required="true"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={styles.input}
            autoComplete="email"
            aria-required="true"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="message" className={styles.label}>Message</label>
          <textarea
            id="message"
            name="message"
            required
            className={styles.textarea}
            rows={5}
            aria-required="true"
          />
        </div>

        <button type="submit" disabled={status === "loading"} className={styles.submit}>
          {status === "loading" ? "Sending…" : "Send Message"}
        </button>

        {status === "success" && (
          <p className={styles.success} role="status">
            Message sent! I&#39;ll get back to you soon.
          </p>
        )}
        {status === "error" && (
          <p className={styles.error} role="alert">
            Something went wrong. Please try again or email me directly.
          </p>
        )}
      </form>
    </div>
  );
}
