"use client";

import { useEffect, useState } from "react";
import page from "./holoPage.module.css";

// Client wrapper that supplies the holo page container (.wrap) and triggers the
// staggered entrance cascade (.play) after mount. Server pages render their
// content (with `page.rise` on staggerable blocks) inside this. Respects
// prefers-reduced-motion by revealing immediately.
export default function HoloReveal({
  wide = false,
  amber = false,
  children,
}: {
  wide?: boolean;
  amber?: boolean;
  children: React.ReactNode;
}) {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setPlay(true);
      return;
    }
    const t = setTimeout(() => setPlay(true), 60);
    return () => clearTimeout(t);
  }, []);

  const className = [
    page.wrap,
    wide && page.wide,
    amber && page.amber,
    play && page.play,
  ]
    .filter(Boolean)
    .join(" ");

  return <main className={className}>{children}</main>;
}
