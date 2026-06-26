"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./typedReveal.module.css";

export type TypedStep =
  | { kind: "command"; text: string; className?: string }
  | {
      kind: "line";
      text: string;
      tone?: "error";
      speed?: "normal" | "fast";
      className?: string;
    }
  | {
      kind: "reveal";
      node: React.ReactNode;
      stagger?: number;
      className?: string;
    };

const TYPE_MS = 1000; // command + normal line type-out duration
const FAST_MS = 1100; // fast line (e.g. resume summary)
const GAP_MS = 120; // pause between finishing a typed step and the next
const DEFAULT_STAGGER = 70; // ms between [data-rise] elements

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// Reveal block: renders its node always (hidden via CSS until active). On
// activation, assigns each [data-rise] descendant an animation-delay of
// index * stagger so the cascade works at any depth and any interval.
function RevealBlock({
  active,
  stagger,
  className,
  children,
}: {
  active: boolean;
  stagger: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const rises = ref.current.querySelectorAll<HTMLElement>("[data-rise]");
    rises.forEach((el, i) => {
      el.style.animationDelay = `${i * stagger}ms`;
    });
  }, [active, stagger]);
  return (
    <div
      ref={ref}
      className={cx(styles.reveal, active && styles.revealActive, className)}
    >
      {children}
    </div>
  );
}

export default function TypedReveal({
  name = "Kendall Adkins",
  wide = false,
  amber = false,
  head,
  steps,
}: {
  name?: string;
  wide?: boolean;
  amber?: boolean;
  head?: React.ReactNode;
  steps: TypedStep[];
}) {
  const prompt = `${name.split(" ")[0].toLowerCase()}@adkins:~$`;
  const [current, setCurrent] = useState(0); // index of the running step
  const [typed, setTyped] = useState(""); // typed-so-far for the active typed step
  const reduceRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // detect reduced motion once; if set, show everything immediately
  useEffect(() => {
    reduceRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceRef.current) setCurrent(steps.length);
  }, [steps.length]);

  // run the current step
  useEffect(() => {
    if (reduceRef.current) return;
    if (current >= steps.length) return;
    const step = steps[current];

    // reveal: activated by render (current passes it); advance next tick
    if (step.kind === "reveal") {
      const t = setTimeout(() => setCurrent((c) => c + 1), 0);
      timers.current.push(t);
      return () => clearTimeout(t);
    }

    // command | line: type out, then advance
    const text = step.text;
    setTyped("");
    const local: ReturnType<typeof setTimeout>[] = [];

    if (step.kind === "line" && step.speed === "fast") {
      // chunked typing: whole string in ~FAST_MS regardless of length
      const frames = Math.max(1, Math.round(FAST_MS / 16));
      const chars = Math.max(1, Math.ceil(text.length / frames));
      let shown = 0;
      let frame = 0;
      while (shown < text.length) {
        shown = Math.min(text.length, shown + chars);
        const n = shown;
        local.push(setTimeout(() => setTyped(text.slice(0, n)), frame * 16));
        frame++;
      }
      local.push(
        setTimeout(() => setCurrent((c) => c + 1), frame * 16 + GAP_MS)
      );
    } else {
      // one char at a time, spaced so the whole line takes ~TYPE_MS
      const perChar = Math.max(16, TYPE_MS / Math.max(1, text.length));
      for (let n = 1; n <= text.length; n++) {
        local.push(setTimeout(() => setTyped(text.slice(0, n)), n * perChar));
      }
      local.push(
        setTimeout(
          () => setCurrent((c) => c + 1),
          text.length * perChar + GAP_MS
        )
      );
    }

    timers.current.push(...local);
    return () => local.forEach(clearTimeout);
  }, [current, steps]);

  // clear all timers on unmount
  useEffect(() => {
    const all = timers.current;
    return () => all.forEach(clearTimeout);
  }, []);

  return (
    <main
      className={cx(styles.wrap, wide && styles.wide, amber && styles.amber)}
    >
      {head}
      {steps.map((step, i) => {
        const past = i < current;
        const active = i === current;

        if (step.kind === "reveal") {
          return (
            <RevealBlock
              key={i}
              active={past || reduceRef.current}
              stagger={step.stagger ?? DEFAULT_STAGGER}
              className={step.className}
            >
              {step.node}
            </RevealBlock>
          );
        }

        const isCmd = step.kind === "command";
        const text =
          past || reduceRef.current ? step.text : active ? typed : "";
        const showCursor = isCmd && active && !reduceRef.current;
        const tone =
          step.kind === "line" && step.tone === "error" ? styles.error : "";

        return (
          <div key={i} className={cx(styles.crumb, tone, step.className)}>
            {isCmd && <span className={styles.ps}>{prompt}</span>}
            {isCmd ? " " : ""}
            {text}
            {showCursor && <span className={styles.cur} aria-hidden="true" />}
          </div>
        );
      })}
    </main>
  );
}
