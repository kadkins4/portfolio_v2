"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import styles from "./careerLog.module.css";

export type Experience = {
  org: string;
  role: string;
  period: string;
  detail: string;
  highlights: string[];
  tech: string[];
};
export type Earlier = {
  org: string;
  role: string;
  period: string;
  detail: string;
};
export type Education = { school: string; credential: string; year: string };

export type CareerLogData = {
  name: string;
  summary: string;
  resumePdf: string;
  experience: Experience[];
  earlier: Earlier[];
  education: Education[];
};

type Category = "PROFESSIONAL" | "EDUCATION";
type Entry = {
  period: string;
  title: string;
  org: string;
  cat: Category;
  detail: string;
  highlights: string[];
  tech: string[];
};
type OutLine = { cmd: string; out: string };

const PROMPT = "kendall@adkins:~$";
const CMD = "cat resume.md";

export default function CareerLog({ data }: { data: CareerLogData }) {
  // entrance state
  const [cmd, setCmd] = useState("");
  const [cmdDone, setCmdDone] = useState(false);
  const [summaryTyped, setSummaryTyped] = useState("");
  const [revealed, setRevealed] = useState(false); // rail + shell in
  const [nodesIn, setNodesIn] = useState(0);

  // interaction state
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [shellFocused, setShellFocused] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutLine[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const histIdx = useRef<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // unified, most-recent-first timeline (source is already ordered newest→oldest)
  const entries: Entry[] = useMemo(() => {
    const pro: Entry[] = data.experience.map((e) => ({
      period: e.period,
      title: e.role,
      org: e.org,
      cat: "PROFESSIONAL",
      detail: e.detail,
      highlights: e.highlights,
      tech: e.tech,
    }));
    const early: Entry[] = data.earlier.map((e) => ({
      period: e.period,
      title: e.role,
      org: e.org,
      cat: "PROFESSIONAL",
      detail: e.detail,
      highlights: [],
      tech: [],
    }));
    const edu: Entry[] = data.education.map((e) => ({
      period: e.year,
      title: e.credential,
      org: e.school,
      cat: "EDUCATION",
      detail: "",
      highlights: [],
      tech: [],
    }));
    return [...pro, ...early, ...edu];
  }, [data]);

  // ---- entrance sequence ----
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      setCmd(CMD);
      setCmdDone(true);
      setSummaryTyped(data.summary);
      setRevealed(true);
      setNodesIn(entries.length);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    // 1) type the command over ~1s
    const perChar = 1000 / CMD.length;
    for (let i = 1; i <= CMD.length; i++) {
      at(() => setCmd(CMD.slice(0, i)), 350 + i * perChar);
    }
    const cmdEnd = 350 + CMD.length * perChar;
    at(() => setCmdDone(true), cmdEnd);

    // 2) type the summary fast (~1.1s regardless of length)
    const sStart = cmdEnd + 220;
    const sBudget = 1100;
    const sStep = Math.max(1, Math.ceil(data.summary.length / (sBudget / 16)));
    let shown = 0;
    let frame = 0;
    while (shown < data.summary.length) {
      shown = Math.min(data.summary.length, shown + sStep);
      const n = shown;
      at(() => setSummaryTyped(data.summary.slice(0, n)), sStart + frame * 16);
      frame++;
    }
    const sEnd = sStart + frame * 16;

    // 3) shell + rail reveal, then 4) nodes cascade every 0.5s
    at(() => setRevealed(true), sEnd);
    for (let i = 0; i < entries.length; i++) {
      at(() => setNodesIn(i + 1), sEnd + 200 + i * 500);
    }

    return () => timers.forEach(clearTimeout);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  function run(raw: string) {
    const line = raw.trim();
    if (!line) return;
    const verb = line.toLowerCase().split(/\s+/)[0];
    let out = "";
    switch (verb) {
      case "help":
        out =
          "available commands:\n" +
          "  ls         list roles\n" +
          "  whoami     summary\n" +
          "  download   grab the PDF résumé\n" +
          "  clear      clear the log";
        break;
      case "ls":
        out = entries.map((e) => `${e.period.padEnd(20)} ${e.org}`).join("\n");
        break;
      case "whoami":
        out = `${data.name}\n${data.summary}`;
        break;
      case "download":
      case "resume":
      case "pdf":
        out = "opening résumé.pdf…";
        window.open(data.resumePdf, "_blank");
        break;
      case "clear":
        setOutput([]);
        return;
      default:
        out = `command not found: ${verb}. type "help".`;
    }
    setOutput((p) => [...p, { cmd: line, out }]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      run(input);
      if (input.trim()) {
        setHistory((h) => [...h, input.trim()]);
        histIdx.current = -1;
      }
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      histIdx.current =
        histIdx.current < 0
          ? history.length - 1
          : Math.max(0, histIdx.current - 1);
      setInput(history[histIdx.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx.current < 0) return;
      histIdx.current += 1;
      if (histIdx.current >= history.length) {
        histIdx.current = -1;
        setInput("");
      } else {
        setInput(history[histIdx.current]);
      }
    }
  }

  const showHint = !shellFocused && !input && output.length === 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>Resume</h1>
        <a className={styles.download} href={data.resumePdf} download>
          ↓ download résumé.pdf
        </a>
      </div>

      <div className={styles.crumb}>
        <span className={styles.ps}>{PROMPT}</span> {cmd}
        {!cmdDone && <span className={styles.cur} aria-hidden="true" />}
      </div>

      <p className={styles.summary}>{summaryTyped}</p>

      {/* interactive shell — always shown, cursor blinks only when focused */}
      <div
        className={`${styles.shell} ${shellFocused ? styles.shellFocused : ""} ${
          revealed ? styles.in : ""
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        {output.length > 0 && (
          <div className={styles.shellHistory}>
            {output.map((o, i) => (
              <div key={i}>
                <div className={styles.shellEchoLine}>
                  <span className={styles.ps}>{PROMPT}</span> {o.cmd}
                </div>
                <div className={styles.shellOut}>{o.out}</div>
              </div>
            ))}
          </div>
        )}
        <div className={styles.shellLine}>
          <span className={styles.ps}>{PROMPT}</span>
          <span className={styles.shellEcho}>{input}</span>
          <span className={styles.shellCur} aria-hidden="true" />
          {showHint && (
            <span className={styles.shellHint}>
              type &quot;help&quot; — try ls · whoami · download
            </span>
          )}
          <input
            ref={inputRef}
            className={styles.shellInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setShellFocused(true)}
            onBlur={() => setShellFocused(false)}
            autoComplete="off"
            spellCheck={false}
            aria-label="terminal command input"
          />
        </div>
      </div>

      <div
        className={`${styles.timeline} ${revealed ? styles.timelineIn : ""}`}
      >
        {entries.map((e, i) => {
          const open = expanded.has(i);
          const hasBody =
            !!e.detail || e.highlights.length > 0 || e.tech.length > 0;
          return (
            <div
              key={e.org + i}
              className={`${styles.node} ${i < nodesIn ? styles.nodeIn : ""}`}
            >
              <div
                className={`${styles.card} ${open ? styles.cardOpen : ""}`}
                role={hasBody ? "button" : undefined}
                tabIndex={hasBody ? 0 : undefined}
                aria-expanded={hasBody ? open : undefined}
                onClick={hasBody ? () => toggle(i) : undefined}
                onKeyDown={
                  hasBody
                    ? (ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          toggle(i);
                        }
                      }
                    : undefined
                }
                style={hasBody ? undefined : { cursor: "default" }}
              >
                <div className={styles.main}>
                  <div className={styles.period}>{e.period}</div>
                  <h2 className={styles.role}>{e.title}</h2>
                  {e.org && <div className={styles.org}>{e.org}</div>}
                </div>
                <div className={styles.right}>
                  <span
                    className={`${styles.pill} ${
                      e.cat === "EDUCATION" ? styles.pillEdu : ""
                    }`}
                  >
                    {e.cat}
                  </span>
                  {hasBody && <span className={styles.arrow}>▸</span>}
                </div>
                {hasBody && (
                  <div className={styles.body}>
                    <div className={styles.bodyInner}>
                      {e.detail && <p className={styles.detail}>{e.detail}</p>}
                      {e.highlights.length > 0 && (
                        <ul className={styles.highlights}>
                          {e.highlights.map((h, hi) => (
                            <li key={hi}>{h}</li>
                          ))}
                        </ul>
                      )}
                      {e.tech.length > 0 && (
                        <div className={styles.tech}>
                          {e.tech.map((t) => (
                            <span key={t} className={styles.techTag}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
