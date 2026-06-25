"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./typedCrumb.module.css";

// The shared "terminal item" at the top of inner pages. Types a command after
// `name@adkins:~$` over ~1s; the cursor blinks only while typing and is removed
// when done. `onDone` lets a page chain its own entrance (e.g. resume's reveal,
// work's card cascade). Reduced motion shows the full command instantly.
export default function TypedCrumb({
  command,
  name = "Kendall Adkins",
  startDelay = 350,
  onDone,
}: {
  command: string;
  name?: string;
  startDelay?: number;
  onDone?: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const prompt = `${name.split(" ")[0].toLowerCase()}@adkins:~$`;

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      setTyped(command);
      setDone(true);
      onDoneRef.current?.();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const perChar = 1000 / command.length;
    for (let i = 1; i <= command.length; i++) {
      timers.push(
        setTimeout(
          () => setTyped(command.slice(0, i)),
          startDelay + i * perChar
        )
      );
    }
    timers.push(
      setTimeout(
        () => {
          setDone(true);
          onDoneRef.current?.();
        },
        startDelay + command.length * perChar
      )
    );

    return () => timers.forEach(clearTimeout);
  }, [command, startDelay]);

  return (
    <div className={styles.crumb}>
      <span className={styles.ps}>{prompt}</span> {typed}
      {!done && <span className={styles.cur} aria-hidden="true" />}
    </div>
  );
}
