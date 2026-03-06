"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./not-found.module.css";

const messages = [
  "Looks like this page took a coffee break.",
  "This page wandered off to learn a new framework.",
  "404: Page not found. It's probably refactoring itself.",
  "Oops! This route doesn't exist… yet.",
  "The page you're looking for is mass undefined.",
];

export default function NotFound() {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, []);

  return (
    <main className={styles.container}>
      <Image
        src="/images/404-illustration.svg"
        alt=""
        width={280}
        height={200}
        className={styles.illustration}
        priority
      />
      <h1 className={styles.heading}>404</h1>
      <p className={styles.message}>{message}</p>
      <div className={styles.cta}>
        <Link href="/" className={styles.btnPrimary}>
          Back to Home
        </Link>
        <Link href="/projects" className={styles.btnGhost}>
          View Projects
        </Link>
      </div>
    </main>
  );
}
