"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./scrollToTop.module.css";

// Floating "back to top" affordance. Inner holo pages scroll on the window
// (the .shell container only reports overflow-y: auto as a side effect of
// overflow-x: hidden; it never actually scrolls). Appears once scrolled far
// enough to need it, so short pages never show it. Mounted via HoloFrame.
export default function ScrollToTop() {
  const ref = useRef<HTMLButtonElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toTop() {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Scroll to top"
      className={`${styles.btn} ${show ? styles.show : ""}`}
      onClick={toTop}
      tabIndex={show ? 0 : -1}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
