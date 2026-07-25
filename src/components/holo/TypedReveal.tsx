"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { promptFor } from "./prompt";
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
  backHref,
  backLabel,
}: {
  name?: string;
  wide?: boolean;
  amber?: boolean;
  head?: React.ReactNode;
  steps: TypedStep[];
  backHref?: string;
  backLabel?: string;
}) {
  const prompt = promptFor(name);
  const reduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0); // index of the running step
  // typed-so-far, tagged with the step it belongs to. Tagging lets render
  // ignore text left over from the previous step instead of the effect having
  // to clear it with a synchronous setState on every advance.
  const [typed, setTyped] = useState({ step: -1, text: "" });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reduced motion skips the animation wholesale: every step reads as already
  // finished. Derived rather than pushed into `current` via an effect, so it is
  // correct on the very first client render.
  const cursor = reduced ? steps.length : current;

  // run the current step
  useEffect(() => {
    if (reduced) return;
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
    const local: ReturnType<typeof setTimeout>[] = [];
    const show = (n: number) =>
      setTyped({ step: current, text: text.slice(0, n) });

    if (step.kind === "line" && step.speed === "fast") {
      // chunked typing: whole string in ~FAST_MS regardless of length
      const frames = Math.max(1, Math.round(FAST_MS / 16));
      const chars = Math.max(1, Math.ceil(text.length / frames));
      let shown = 0;
      let frame = 0;
      while (shown < text.length) {
        shown = Math.min(text.length, shown + chars);
        const n = shown;
        local.push(setTimeout(() => show(n), frame * 16));
        frame++;
      }
      local.push(
        setTimeout(() => setCurrent((c) => c + 1), frame * 16 + GAP_MS)
      );
    } else {
      // one char at a time, spaced so the whole line takes ~TYPE_MS
      const perChar = Math.max(16, TYPE_MS / Math.max(1, text.length));
      for (let n = 1; n <= text.length; n++) {
        local.push(setTimeout(() => show(n), n * perChar));
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
  }, [current, steps, reduced]);

  // clear all timers on unmount
  useEffect(() => {
    const all = timers.current;
    return () => all.forEach(clearTimeout);
  }, []);

  const showBack = Boolean(backHref && backLabel);
  const done = cursor >= steps.length;

  return (
    <main
      className={cx(styles.wrap, wide && styles.wide, amber && styles.amber)}
    >
      {showBack && (
        <Link href={backHref!} className={styles.backTop}>
          ← {backLabel}
        </Link>
      )}
      {head}
      {steps.map((step, i) => {
        // Under reduced motion `cursor` is already past the end, so every step
        // reads as `past` and nothing needs a separate reduced-motion branch.
        const past = i < cursor;
        const active = i === cursor;

        if (step.kind === "reveal") {
          return (
            <RevealBlock
              key={i}
              active={past}
              stagger={step.stagger ?? DEFAULT_STAGGER}
              className={step.className}
            >
              {step.node}
            </RevealBlock>
          );
        }

        const isCmd = step.kind === "command";
        // Text tagged for a different step is leftover from the previous one.
        const shown = typed.step === i ? typed.text : "";
        const text = past ? step.text : active ? shown : "";
        const showCursor = isCmd && active;
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
      {showBack && (
        <div>
          <Link
            href={backHref!}
            className={cx(styles.backBottom, done && styles.backBottomShown)}
          >
            ← {backLabel}
          </Link>
        </div>
      )}
    </main>
  );
}
