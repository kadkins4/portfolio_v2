"use client";

import { useEffect, useState } from "react";
import TypedCrumb from "./TypedCrumb";
import page from "./holoPage.module.css";

// Client wrapper for holo inner pages. Matches the resume entrance: a static
// `head` (title) renders immediately, the `command` crumb types out, and only
// then does the `.rise` cascade for the rest of the content play (children).
// Pages without a command fall back to the legacy 60ms-after-mount cascade.
export default function HoloReveal({
  wide = false,
  amber = false,
  command,
  name,
  head,
  children,
}: {
  wide?: boolean;
  amber?: boolean;
  command?: string;
  name?: string;
  head?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (command) return; // the crumb drives the cascade via onDone
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setPlay(true);
      return;
    }
    const t = setTimeout(() => setPlay(true), 60);
    return () => clearTimeout(t);
  }, [command]);

  const className = [
    page.wrap,
    wide && page.wide,
    amber && page.amber,
    play && page.play,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={className}>
      {head}
      {command && (
        <TypedCrumb
          command={command}
          name={name}
          onDone={() => setPlay(true)}
        />
      )}
      {children}
    </main>
  );
}
