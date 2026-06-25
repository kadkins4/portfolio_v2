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

const PROMPT = "kendall@adkins:~$";
const ENTRANCE = "cat resume.md";

type OutLine = { cmd: string; out: string };

export default function CareerLog({ data }: { data: CareerLogData }) {
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutLine[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const histIdx = useRef<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // unique tech tags for filter chips
  const techs = useMemo(() => {
    const seen = new Set<string>();
    data.experience.forEach((e) => e.tech.forEach((t) => seen.add(t)));
    return Array.from(seen);
  }, [data.experience]);

  // typed-command entrance
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setTyped(ENTRANCE);
      setRevealed(true);
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setTyped(ENTRANCE.slice(0, i));
      if (i < ENTRANCE.length) {
        timer = setTimeout(tick, 55);
      } else {
        timer = setTimeout(() => setRevealed(true), 180);
      }
    };
    timer = setTimeout(tick, 350);
    return () => clearTimeout(timer);
  }, []);

  const toggle = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const matches = (e: Experience) =>
    !filter ||
    e.tech.some((t) => t.toLowerCase().includes(filter.toLowerCase()));

  function run(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;
    const [verb, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");
    let out = "";

    switch (verb.toLowerCase()) {
      case "help":
        out =
          "available commands:\n" +
          "  ls            list roles\n" +
          "  whoami        summary\n" +
          "  filter <tech> dim roles missing a tech (filter all = reset)\n" +
          "  expand <org>  open a role (expand all)\n" +
          "  collapse      close all roles\n" +
          "  download      grab the PDF résumé\n" +
          "  clear         clear the log";
        break;
      case "ls":
        out = data.experience
          .map((e) => `${e.period.padEnd(20)} ${e.org}`)
          .join("\n");
        break;
      case "whoami":
        out = `${data.name}\n${data.summary}`;
        break;
      case "filter":
        if (!arg || /^(all|clear|reset|none)$/i.test(arg)) {
          setFilter(null);
          out = "filter cleared.";
        } else {
          const hit = techs.find((t) =>
            t.toLowerCase().includes(arg.toLowerCase())
          );
          if (hit) {
            setFilter(hit);
            out = `filtering by "${hit}".`;
          } else {
            out = `no roles tagged "${arg}". try: ${techs.join(", ")}`;
          }
        }
        break;
      case "expand": {
        if (/^all$/i.test(arg)) {
          setExpanded(new Set(data.experience.map((_, i) => i)));
          out = "expanded all roles.";
          break;
        }
        const idx = data.experience.findIndex((e) =>
          e.org.toLowerCase().includes(arg.toLowerCase())
        );
        if (idx >= 0) {
          setExpanded((p) => new Set(p).add(idx));
          out = `expanded ${data.experience[idx].org}.`;
        } else {
          out = `no role matching "${arg}".`;
        }
        break;
      }
      case "collapse":
        setExpanded(new Set());
        out = "collapsed all roles.";
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
    setOutput((p) => [...p, { cmd, out }]);
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

  return (
    <div className={`${styles.wrap} ${revealed ? styles.revealed : ""}`}>
      <div className={styles.head}>
        <h1 className={styles.title}>Resume</h1>
        <span className={styles.entries}>
          <span className={styles.dot} aria-hidden="true" />
          {data.experience.length} ROLES
        </span>
      </div>

      <div className={styles.term}>
        <div className={styles.crumb}>
          <span className={styles.ps}>{PROMPT}</span> {typed}
          {!revealed && <span className={styles.cur} aria-hidden="true" />}
        </div>

        {revealed && (
          <>
            <p className={styles.summary}>{data.summary}</p>

            {techs.length > 0 && (
              <div className={styles.filters}>
                <button
                  className={`${styles.chip} ${filter === null ? styles.chipActive : ""}`}
                  onClick={() => setFilter(null)}
                >
                  all
                </button>
                {techs.map((t) => (
                  <button
                    key={t}
                    className={`${styles.chip} ${filter === t ? styles.chipActive : ""}`}
                    onClick={() => setFilter((f) => (f === t ? null : t))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.timeline}>
              {data.experience.map((e, i) => {
                const open = expanded.has(i);
                const dim = !matches(e);
                return (
                  <div
                    key={e.org + i}
                    className={`${styles.node} ${dim ? styles.nodeDim : ""}`}
                  >
                    <button
                      className={styles.nodeHead}
                      onClick={() => toggle(i)}
                      aria-expanded={open}
                    >
                      <span className={styles.period}>{e.period}</span>
                      <span className={styles.org}>{e.org}</span>
                      <span className={styles.role}>{e.role}</span>
                      <span className={styles.toggle}>
                        {open ? "▾ collapse" : "▸ expand"}
                      </span>
                    </button>
                    <div
                      className={`${styles.body} ${open ? styles.bodyOpen : ""}`}
                    >
                      <div className={styles.bodyInner}>
                        {e.detail && (
                          <p className={styles.detail}>{e.detail}</p>
                        )}
                        <ul className={styles.highlights}>
                          {e.highlights.map((h, hi) => (
                            <li key={hi}>{h}</li>
                          ))}
                        </ul>
                        <div className={styles.tech}>
                          {e.tech.map((t) => (
                            <span key={t} className={styles.techTag}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {data.earlier.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionLabel}>~/ EARLIER</div>
                {data.earlier.map((e, i) => (
                  <div key={i} className={styles.miniRow}>
                    <span>
                      <span className={styles.miniOrg}>{e.org}</span>{" "}
                      <span className={styles.miniRole}>— {e.role}</span>
                    </span>
                    <span className={styles.miniPeriod}>{e.period}</span>
                  </div>
                ))}
              </div>
            )}

            {data.education.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionLabel}>~/ EDUCATION</div>
                {data.education.map((e, i) => (
                  <div key={i} className={styles.miniRow}>
                    <span>
                      <span className={styles.miniOrg}>{e.school}</span>{" "}
                      <span className={styles.miniRole}>— {e.credential}</span>
                    </span>
                    <span className={styles.miniPeriod}>{e.year}</span>
                  </div>
                ))}
              </div>
            )}

            {/* command output history */}
            {output.length > 0 && (
              <div className={styles.cmdHistory}>
                {output.map((o, i) => (
                  <div key={i}>
                    <div className={styles.cmdEcho}>
                      <span className={styles.ps}>{PROMPT}</span> {o.cmd}
                    </div>
                    <div className={styles.cmdOut}>{o.out}</div>
                  </div>
                ))}
              </div>
            )}

            {/* live command line */}
            <div
              className={styles.cmdLine}
              onMouseDown={(ev) => {
                ev.preventDefault();
                inputRef.current?.focus();
              }}
            >
              <span className={styles.ps}>{PROMPT}</span>
              <span className={styles.echo}>{input}</span>
              <span className={styles.blk} aria-hidden="true" />
              {!input && <span className={styles.hint}>help</span>}
              <input
                ref={inputRef}
                className={styles.hiddenInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                spellCheck={false}
                aria-label="terminal command input"
              />
            </div>

            <div className={styles.actions}>
              <a className={styles.download} href={data.resumePdf} download>
                ↓ download résumé.pdf
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
