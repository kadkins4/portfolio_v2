import { useSyncExternalStore } from "react";

const COARSE = "(pointer: coarse)";

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(COARSE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia(COARSE).matches;
  return coarse || navigator.maxTouchPoints > 0;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * True on touch-capable / coarse-pointer devices. SSR-safe: the server snapshot
 * is `false`, so markup matches on hydration, and the real value lands on the
 * first client render instead of after a second pass. Re-reads if the pointer
 * type changes (a tablet gaining a mouse, devtools device emulation).
 */
export function useIsTouch(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
