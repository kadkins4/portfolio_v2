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

function collidersSnapshot(): boolean {
  return localStorage.getItem(COLLIDERS_KEY) === "1";
}

/** Persist the collider-overlay choice and notify every mounted reader. */
export function writeColliders(on: boolean) {
  localStorage.setItem(COLLIDERS_KEY, on ? "1" : "0");
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
