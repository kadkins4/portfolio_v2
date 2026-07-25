import { useSyncExternalStore } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return (
    typeof window.matchMedia === "function" && window.matchMedia(REDUCE).matches
  );
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * True when the viewer has asked the OS to reduce motion. SSR-safe: the server
 * snapshot is `false`, so server markup is the full-motion variant and matches
 * on hydration, while the real value lands on the first client render rather
 * than after an effect — no frame of animation plays before we bail out of it.
 * Re-reads if the OS setting is toggled while the page is open.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
