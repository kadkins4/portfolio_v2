"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./terminalShell.module.css";

// Shared interactive terminal shell: a prompt line with a hidden input that
// steals focus on click. Used by the projects filter (SelectedWork) and the
// resume command runner (CareerLog). Divergent behavior lives in the parent —
// this owns only the focus state, the input line, and an optional history slot
// rendered above it (children).
export default function TerminalShell({
  prompt,
  value,
  onChange,
  onKeyDown,
  cmd,
  hint,
  ariaLabel,
  className,
  children,
}: {
  prompt: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  cmd?: string;
  hint?: ReactNode;
  ariaLabel: string;
  className?: string;
  children?: ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`${styles.shell} ${focused ? styles.shellFocused : ""} ${
        className ?? ""
      }`}
      onMouseDown={(e) => {
        e.preventDefault();
        inputRef.current?.focus();
      }}
    >
      {children}
      <div className={styles.shellLine}>
        <span className={styles.ps}>{prompt}</span>
        {cmd && <span className={styles.shellCmd}>{cmd}</span>}
        <span className={styles.shellEcho}>{value}</span>
        <span className={styles.shellCur} aria-hidden="true" />
        {hint && <span className={styles.shellHint}>{hint}</span>}
        <input
          ref={inputRef}
          className={styles.shellInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          spellCheck={false}
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}
