import { useSyncExternalStore } from "react";

const COLLIDERS_KEY = "neoncity.colliders";

// `colliders` is read *and* written (the dev panel toggles it), so it cannot be
// a plain derived read the way the other client-only values are. localStorage
// is the store; this is the subscription React needs to see writes to it.
const listeners = new Set<() => void>();

function subscribeColliders(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

// This snapshot runs during render, so it must not throw: `localStorage` raises
// SecurityError on access — not just on write — when storage is blocked (Safari
// "block all cookies", a partitioned third-party context). Unguarded, that
// throw propagates out of getSnapshot and takes the whole city down to the
// nearest error boundary, for a dev-only overlay an ordinary visitor never sees.
function collidersSnapshot(): boolean {
  try {
    return localStorage.getItem(COLLIDERS_KEY) === "1";
  } catch {
    return false;
  }
}

/** Persist the collider-overlay choice and notify every mounted reader. */
export function writeColliders(on: boolean) {
  try {
    localStorage.setItem(COLLIDERS_KEY, on ? "1" : "0");
  } catch {
    // Storage blocked. The overlay still toggles for this render pass; it just
    // will not survive a reload.
  }
  listeners.forEach((l) => l());
}

export function useColliders(): boolean {
  return useSyncExternalStore(
    subscribeColliders,
    collidersSnapshot,
    () => false
  );
}

// The URL is fixed for the lifetime of the mount — a query-string change is a
// navigation, which remounts — so there is nothing to subscribe to.
const noopSubscribe = () => () => {};

function devSnapshot(): boolean {
  return new URLSearchParams(window.location.search).get("dev") === "1";
}

/** True when the page was opened with ?dev=1. */
export function useDevFlag(): boolean {
  return useSyncExternalStore(noopSubscribe, devSnapshot, () => false);
}
