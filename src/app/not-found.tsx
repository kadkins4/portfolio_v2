"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./not-found.module.css";

const messages = [
  "Page not found. It probably took a coffee break.",
  "Page not found. It wandered off to learn a new framework.",
  "Page not found. It's probably refactoring itself.",
  "Page not found. This route doesn't exist… yet.",
  "Page not found. The page you're looking for is undefined.",
  "Page not found. It's out chasing a missing semicolon.",
  "Page not found. It went to go fix a merge conflict.",
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
        <Link href="/work" className={styles.btnGhost}>
          View Work
        </Link>
      </div>
    </main>
  );
}
