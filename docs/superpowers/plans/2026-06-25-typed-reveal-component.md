# TypedReveal Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace three separate "type a terminal command, then reveal content" entrance implementations with one `TypedReveal` component that owns a typed-step sequence and a cascade reveal.

**Architecture:** A client component renders an always-visible `head` plus an ordered `steps` array. Each step is a typed `command`, a typed `line` (output), or a `reveal` block. Steps run strictly in order; nothing in a step shows until prior steps finish. Reveal blocks stay in the DOM (hidden) and, on activation, cascade their `[data-rise]` descendants via JS-assigned `animation-delay`. All gating/keyframes live in one CSS module so the `opacity` base can't regress per page.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), CSS Modules (no Tailwind), Vitest + Testing Library, pnpm.

## Global Constraints

- Branch is `holo-terminal-redesign`. Commit there; never merge to main (Kenny merges manually).
- Commit messages: short, imperative, NO `Co-Authored-By` trailer.
- No Tailwind. Plain CSS modules only. Holo accent tokens are oklch; cyan is `oklch(0.86 0.13 190)`.
- Reduced motion must show all content immediately with no animation, and must never leave content stuck at `opacity: 0`.
- Reveal content must remain in the DOM (hidden) for SEO — never gate it with `display:none` / conditional non-render.
- Verification gate per task: `node_modules/.bin/tsc --noEmit` clean, `CI=true node_modules/.bin/vitest run` green. Dev server runs at `:3001` (`CI=true node_modules/.bin/next dev --port 3001`); screenshots/opacity checks via Playwright MCP save under `.playwright-mcp/`.
- The fold-in removes `TypedCrumb`; its prompt is `<firstname>@adkins:~$` where firstname = `name.split(" ")[0].toLowerCase()`.

---

### Task 1: Build the TypedReveal component

**Files:**

- Create: `src/components/holo/TypedReveal.tsx`
- Create: `src/components/holo/typedReveal.module.css`
- Test: `src/components/holo/TypedReveal.test.tsx`

**Interfaces:**

- Produces:

  ```ts
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

  export default function TypedReveal(props: {
    name?: string; // default "Kendall Adkins"
    wide?: boolean;
    amber?: boolean;
    head?: React.ReactNode;
    steps: TypedStep[];
  }): JSX.Element;
  ```

- Consumes: nothing from other tasks.

- [ ] **Step 1: Write the CSS module**

Create `src/components/holo/typedReveal.module.css`:

```css
/* Unified terminal entrance: typed command/output lines, then a reveal block
   whose [data-rise] descendants cascade in. All gating lives here so the
   opacity base cannot regress per page. */

.wrap {
  --accent: oklch(0.86 0.13 190);
  --accent-soft: oklch(0.7 0.1 190);
  --muted: rgba(234, 246, 244, 0.55);

  max-width: 820px;
  margin: 0 auto;
  padding: 24px 18px 80px;
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-mono), ui-monospace, monospace;
  color: #eaf6f4;
}
.wide {
  max-width: 1080px;
}
.amber {
  --accent: oklch(0.84 0.14 45);
  --accent-soft: oklch(0.74 0.13 45);
}
@media (min-width: 820px) {
  .wrap {
    padding: 36px 32px 100px;
  }
}

/* typed command / output lines */
.crumb {
  margin: 18px 0 0;
  font-size: 13px;
  color: var(--muted);
  min-height: 1.2em;
}
.ps {
  color: var(--accent);
}
.error {
  color: oklch(0.74 0.16 35);
}
.cur {
  display: inline-block;
  width: 8px;
  height: 15px;
  vertical-align: -2px;
  margin-left: 2px;
  background: var(--accent);
  animation: trBlink 1.1s steps(1) infinite;
}
@keyframes trBlink {
  50% {
    opacity: 0;
  }
}

/* reveal block: whole block hidden until active; rise children cascade */
.reveal {
  opacity: 0;
}
.revealActive {
  opacity: 1;
}
.reveal [data-rise] {
  opacity: 0;
}
.revealActive [data-rise] {
  animation: trRise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
@keyframes trRise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cur {
    animation: none;
  }
  .reveal,
  .revealActive {
    opacity: 1;
  }
  .reveal [data-rise],
  .revealActive [data-rise] {
    opacity: 1;
    animation: none;
  }
}
```

- [ ] **Step 2: Write the component**

Create `src/components/holo/TypedReveal.tsx`:

```tsx
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
```

- [ ] **Step 3: Write the failing test**

Create `src/components/holo/TypedReveal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TypedReveal, { type TypedStep } from "./TypedReveal";

// jsdom lacks matchMedia; default to "reduced motion" so content renders
// immediately and synchronously (no fake timers needed for these assertions).
function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

const steps: TypedStep[] = [
  { kind: "command", text: "cat resume.md" },
  { kind: "line", text: "all systems nominal", tone: "error" },
  { kind: "reveal", node: <p data-rise>revealed body</p> },
];

describe("TypedReveal", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("with reduced motion, shows the head and all step content immediately", () => {
    mockMatchMedia(true);
    render(
      <TypedReveal name="Kendall Adkins" head={<h1>Resume</h1>} steps={steps} />
    );
    expect(screen.getByRole("heading", { name: "Resume" })).toBeInTheDocument();
    expect(screen.getByText("cat resume.md")).toBeInTheDocument();
    expect(screen.getByText("all systems nominal")).toBeInTheDocument();
    expect(screen.getByText("revealed body")).toBeInTheDocument();
  });

  it("renders the command prompt for command steps", () => {
    mockMatchMedia(true);
    render(<TypedReveal name="Kendall Adkins" steps={steps} />);
    expect(screen.getByText("kendall@adkins:~$")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `CI=true node_modules/.bin/vitest run src/components/holo/TypedReveal.test.tsx`
Expected: PASS (2 tests). If it fails to find the component, confirm Steps 1–2 were saved.

- [ ] **Step 5: Typecheck**

Run: `node_modules/.bin/tsc --noEmit`
Expected: clean (exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/components/holo/TypedReveal.tsx src/components/holo/typedReveal.module.css src/components/holo/TypedReveal.test.tsx
git commit -m "Add TypedReveal component"
```

---

### Task 2: Migrate the HoloReveal pages; delete HoloReveal

Migrate the seven pages that use `HoloReveal` to `TypedReveal`, then delete `HoloReveal` and strip the now-unused `.rise`/`.play` cascade from `holoPage.module.css`. The mechanical transform per page:

1. Swap import `HoloReveal` → `TypedReveal`.
2. Replace `<HoloReveal [wide] [amber] command="CMD" name={name} head={HEAD}>CHILDREN</HoloReveal>` with:
   ```tsx
   <TypedReveal
     [wide] [amber]
     name={name}
     head={HEAD}
     steps={[
       { kind: "command", text: "CMD" },
       { kind: "reveal", node: (<>CHILDREN</>) },
     ]}
   />
   ```
3. In CHILDREN, delete every `${page.rise}` (and bare `page.rise`) class and add a `data-rise` attribute to that element instead.

**Files:**

- Modify: `src/app/(site)/story/page.tsx`
- Modify: `src/app/(site)/life/page.tsx`
- Modify: `src/app/(site)/stack/page.tsx`
- Modify: `src/app/(site)/contact/page.tsx`
- Modify: `src/app/(site)/notes/page.tsx`
- Modify: `src/app/(site)/notes/[slug]/page.tsx`
- Modify: `src/app/(site)/projects/[slug]/page.tsx`
- Modify: `src/components/holo/FieldNotes.tsx` (notes index list uses `page.rise`)
- Delete: `src/components/holo/HoloReveal.tsx`
- Modify: `src/components/holo/holoPage.module.css` (remove cascade rules)

**Interfaces:**

- Consumes: `TypedReveal`, `TypedStep` from Task 1.
- Produces: nothing new.

- [ ] **Step 1: Migrate `story/page.tsx`**

Replace the `<HoloReveal>...</HoloReveal>` block (keep imports otherwise; swap the import line). The `head` is unchanged. Final JSX of the reveal:

```tsx
<TypedReveal
  name={name}
  head={
    <div className={`${page.head} ${story.titleRow}`}>
      <Image
        src="/images/kendall-adkins.jpeg"
        alt="Portrait of Kendall Adkins"
        width={92}
        height={92}
        className={story.portrait}
        priority
      />
      <h1 className={page.title}>
        The <i>Story</i>
      </h1>
    </div>
  }
  steps={[
    { kind: "command", text: "cat story.md" },
    {
      kind: "reveal",
      node: (
        <>
          <p className={page.lede} data-rise>
            A decade-long arc from leading teams to senior engineering. He spent
            years in management, taught himself to code, and now ships fast,
            polished web experiences while still mentoring the people around
            him.
          </p>

          <section className={page.section} data-rise>
            <div className={page.sectionLabel}>~/ WHAT I DO</div>
            <div className={page.prose}>
              {whatIDo && renderMarkdoc(whatIDo)}
            </div>
          </section>

          <section className={page.section} data-rise>
            <div className={page.sectionLabel}>~/ HOW I GOT HERE</div>
            <div className={page.prose}>
              {howIGotHere && renderMarkdoc(howIGotHere)}
            </div>
          </section>

          <div className={story.ctaRow} data-rise>
            <a href="/kendall-adkins-resume.pdf" download className={page.cta}>
              ↓ download resume.pdf
            </a>
          </div>

          <div className={page.foot} data-rise>
            &gt; end of story.md
            <span className={page.cur} aria-hidden="true" />
          </div>
        </>
      ),
    },
  ]}
/>
```

And change the import: `import TypedReveal from "@/components/holo/TypedReveal";` (remove the `HoloReveal` import).

- [ ] **Step 2: Migrate `life/page.tsx`**

Swap import to `TypedReveal`. Keep `amber` and `head` as-is. Steps:

```tsx
steps={[
  { kind: "command", text: "cat life.md" },
  {
    kind: "reveal",
    node: (
      <>
        <p className={page.lede} data-rise>
          There is a person behind the commits. Baltimore-raised, now in
          Southern California, with a list of things he chases once the laptop
          closes.
        </p>

        <section className={page.section} data-rise>
          <div className={page.prose}>
            {outsideOfCode && renderMarkdoc(outsideOfCode)}
          </div>
        </section>

        <div className={page.chips} data-rise>
          {INTERESTS.map((t) => (
            <span key={t} className={page.chip}>
              {t}
            </span>
          ))}
        </div>

        <div className={page.foot} data-rise>
          &gt; end of life.md
          <span className={page.cur} aria-hidden="true" />
        </div>
      </>
    ),
  },
]}
```

Pass `amber` on `TypedReveal` (it was on `HoloReveal`).

- [ ] **Step 3: Migrate `stack/page.tsx`**

Swap import. Keep `wide` and `head`. Steps:

```tsx
steps={[
  { kind: "command", text: "cat stack.txt" },
  {
    kind: "reveal",
    node: (
      <>
        <p className={page.lede} data-rise>
          What I build with, grouped by how often it is actually in my hands.
          The top of the list is daily-driver stuff; the bottom is where I go to
          play. No percentages, no proficiency bars. Just an honest map of the
          toolbox.
        </p>

        <div className={styles.grid} data-rise>
          {cards.map((card) => (
            <div key={card.group} className={styles.scard}>
              <span className={styles.sl} aria-hidden="true" />
              <span className={`${styles.bk} ${styles.tl}`} aria-hidden="true" />
              <span className={`${styles.bk} ${styles.br}`} aria-hidden="true" />
              <h3 className={styles.group}>{card.group}</h3>
              <p className={styles.tagline}>{card.tagline}</p>
              <div className={styles.items}>
                {card.items.map((item) => (
                  <span key={item} className={page.chip}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={page.foot} data-rise>
          &gt; end of stack.txt
          <span className={page.cur} aria-hidden="true" />
        </div>
      </>
    ),
  },
]}
```

Pass `wide` on `TypedReveal`.

- [ ] **Step 4: Migrate `contact/page.tsx`**

Swap import. Keep `wide` and `head`. Steps: command `./contact.sh`, then a reveal whose node is the existing children with `${page.lede} ${page.rise}` → `className={page.lede} data-rise` on the lede, and `${styles.grid} ${page.rise}` → `className={styles.grid} data-rise` on the grid, and `${page.foot} ${page.rise}` → `className={page.foot} data-rise` on the foot. The inner channels/ContactForm markup is unchanged.

```tsx
steps={[
  { kind: "command", text: "./contact.sh" },
  {
    kind: "reveal",
    node: (
      <>
        <p className={page.lede} data-rise>
          Got a project, a role, or a question? Send a note and I read every
          one. No email handy? Drop another way to reach you and I&rsquo;ll
          follow up.
        </p>

        <div className={styles.grid} data-rise>
          {/* ...existing ContactForm + channels markup, unchanged... */}
        </div>

        <div className={page.foot} data-rise>
          &gt; connection open · awaiting input
          <span className={page.cur} aria-hidden="true" />
        </div>
      </>
    ),
  },
]}
```

Keep the existing inner content of `styles.grid` exactly as it is today (ContactForm + channels block).

- [ ] **Step 5: Migrate `notes/page.tsx` and `FieldNotes.tsx`**

`notes/page.tsx`: swap import to `TypedReveal`, keep `wide` and `head`, wrap `<FieldNotes items={items} />` in a single reveal step:

```tsx
<TypedReveal
  wide
  name={name}
  head={
    <div className={page.head}>
      <h1 className={page.title}>
        Field <i>Notes</i>
      </h1>
      <span className={page.entries}>
        <span className={page.dot} aria-hidden="true" />
        {items.length} PUBLISHED
      </span>
    </div>
  }
  steps={[
    { kind: "command", text: "ls notes/" },
    { kind: "reveal", node: <FieldNotes items={items} /> },
  ]}
/>
```

`FieldNotes.tsx`: this component currently adds `page.rise` to its own blocks. Replace each `${page.rise}` usage with a `data-rise` attribute and drop the `page` import if it becomes unused (the lede `page.lede`, the filters wrapper, the list wrapper, and the foot). Concretely:

- `className={`${page.lede} ${page.rise}`}` → `className={page.lede} data-rise`
- `className={`${styles.filters} ${page.rise}`}` → `className={styles.filters} data-rise`
- `className={`${styles.list} ${page.rise}`}` → `className={styles.list} data-rise`
- `className={`${page.foot} ${page.rise}`}` → `className={page.foot} data-rise`
- In `NoteCardLink`, the card uses `${styles.card} ${page.rise} ...`; change to keep `styles.card` (+ amber) and add `data-rise` on the `<Link>`. Cards then cascade within the list. Keep `page` import (still used for `page.lede`/`page.foot`).

- [ ] **Step 6: Migrate `notes/[slug]/page.tsx`**

Swap import. Keep `amber={isLife}` and `head`. Wrap children in one reveal; convert the four `${page.rise}` usages to `data-rise`:

```tsx
steps={[
  { kind: "command", text: `cat notes/${slug}.md` },
  {
    kind: "reveal",
    node: (
      <>
        <div className={styles.metaRow} data-rise>
          {/* ...date + tags markup, unchanged... */}
        </div>

        {item.image && (
          <div data-rise>
            <Image /* ...unchanged... */ />
          </div>
        )}

        {contentResult && (
          <article className={page.prose} data-rise>
            {renderMarkdoc(contentResult)}
          </article>
        )}

        <div className={styles.back} data-rise>
          <Link href="/notes" className={page.cta}>
            ← cd notes/
          </Link>
        </div>
      </>
    ),
  },
]}
```

- [ ] **Step 7: Migrate `projects/[slug]/page.tsx`**

Swap import. Keep `head`. Wrap children in one reveal; convert all `${page.rise}` and bare `page.rise` wrappers to `data-rise`:

```tsx
steps={[
  { kind: "command", text: `cat work/${slug}.md` },
  {
    kind: "reveal",
    node: (
      <>
        {item.description && (
          <p className={page.lede} data-rise>{item.description}</p>
        )}

        {tags.length > 0 && (
          <div className={page.chips} data-rise>
            {tags.map((tag: string) => (
              <span key={tag} className={page.chip}>{tag}</span>
            ))}
          </div>
        )}

        {item.image && (
          <div className={styles.shot} data-rise>
            {/* ...Image + corner markup, unchanged... */}
          </div>
        )}

        {contentResult && (
          <div className={page.prose} data-rise>
            {renderMarkdoc(contentResult)}
          </div>
        )}

        {item.externalUrl && (
          <div data-rise>
            <a href={item.externalUrl} className={page.cta} target="_blank" rel="noopener noreferrer">
              view live ↗
            </a>
          </div>
        )}

        <div data-rise>
          <Link href="/work" className={styles.back}>← cd work/</Link>
        </div>

        <div className={page.foot} data-rise>
          &gt; eof
          <span className={page.cur} aria-hidden="true" />
        </div>
      </>
    ),
  },
]}
```

- [ ] **Step 8: Delete HoloReveal and strip the old cascade**

```bash
git rm src/components/holo/HoloReveal.tsx
```

In `src/components/holo/holoPage.module.css`, delete the entrance cascade block — the `.rise`, `.play .rise`, `.play .rise:nth-child(...)` rules and the now-unused `@keyframes hpRise`. In the reduced-motion block, remove the `.play .rise` rule. Leave `hpBlink`/`hpPulse`, `.dot`, `.cur`, and all visual styles intact (they are still used).

- [ ] **Step 9: Verify no stale references**

Run: `grep -rn "HoloReveal\|page.rise\|styles.rise\|\.play" src/app src/components/holo --include="*.tsx" --include="*.css"`
Expected: no matches for `HoloReveal` or `rise` class usage. (`.play` may still appear in `holo.module.css`/`holoFrame` for the gateway/shell — those are unrelated and fine.)

- [ ] **Step 10: Typecheck, test, build**

```bash
node_modules/.bin/tsc --noEmit
CI=true node_modules/.bin/vitest run
CI=true node_modules/.bin/next build
```

Expected: tsc clean, all tests green, build succeeds with all routes listed.

- [ ] **Step 11: Runtime opacity check (story)**

With the dev server running on `:3001`, navigate to `/story`, then evaluate (Playwright MCP):

```js
() => {
  const wrap = document.querySelector('main[class*="wrap"]');
  const playLike = Array.from(wrap.querySelectorAll('[class*="reveal"]')).find(
    Boolean
  );
  const rise = document.querySelector("[data-rise]");
  return { riseOpacity: rise ? getComputedStyle(rise).opacity : "none" };
};
```

Expected (after typing finishes): `riseOpacity` is `"1"`. To confirm the gated base, strip the active class from the reveal wrapper and re-read — it should be `"0"`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "Migrate holo pages to TypedReveal; remove HoloReveal"
```

---

### Task 3: Migrate the Work page (SelectedWork)

**Files:**

- Modify: `src/components/holo/SelectedWork.tsx`
- Modify: `src/components/holo/selectedWork.module.css`

**Interfaces:**

- Consumes: `TypedReveal` from Task 1.
- Produces: nothing new.

- [ ] **Step 1: Rewrite SelectedWork to use TypedReveal**

In `src/components/holo/SelectedWork.tsx`: remove the `TypedCrumb` import and the `play` state; import `TypedReveal`. The title + count stay in `head`; the lede, filters, grid, and foot move into one reveal step. Add `data-rise` to each `<Card>`'s `<Link>` (so cards cascade), and `data-rise` to lede/filters/foot.

Replace the component body's returned JSX with:

```tsx
return (
  <TypedReveal
    wide
    name={name}
    head={
      <div className={styles.head}>
        <h1 className={styles.title}>Work</h1>
        <span className={styles.entries}>
          <span className={styles.dot} aria-hidden="true" />
          {items.length} PROJECTS
        </span>
      </div>
    }
    steps={[
      { kind: "command", text: "ls work/" },
      {
        kind: "reveal",
        node: (
          <>
            <p className={styles.lede} data-rise>
              Shipping for millions one day, building a fantasy-draft tool the
              next. Sports betting and cybersecurity at scale, plus the side
              projects I run myself. Click any card for the writeup; live ones
              link out.
            </p>

            {tags.length > 1 && (
              <div className={styles.filters} data-rise>
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.fchip} ${filter === t ? styles.fon : ""}`}
                    onClick={() => setFilter(t)}
                  >
                    {t === "all" ? "all" : t}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.grid}>
              {visible.map((it) => (
                <Card key={it.slug} item={it} />
              ))}
            </div>

            <div className={styles.foot} data-rise>
              &gt; {visible.length} of {items.length} shown — still shipping
              <span className={styles.cur} aria-hidden="true" />
            </div>
          </>
        ),
      },
    ]}
  />
);
```

In the `Card` component, add `data-rise` to the `<Link>`:

```tsx
<Link href={`/projects/${item.slug}`} className={styles.card} data-rise>
```

Remove the now-unused `useState`/`play` and the `useMemo` imports only if they become unused — `useMemo` is still used for `tags`/`visible`, so keep it; remove `useState` only if no longer used (it is still used for `filter`, so keep it). Remove the `TypedCrumb` import.

- [ ] **Step 2: Remove the bespoke gating from selectedWork.module.css**

In `src/components/holo/selectedWork.module.css`, delete the entrance-cascade block added earlier: the `.lede, .filters, .card, .foot { opacity: 0 }` rule, the `.play .lede`, `.play .filters`, `.play .foot`, `.play .card`, and all `.play .card:nth-child(...)` rules, plus `@keyframes swRise`. In the reduced-motion block, remove the `.play .lede/.filters/.foot/.card` rules. Delete the now-unused `.crumb`/`.cur` typing styles only if unused — `.cur` is still used by the foot cursor, so keep `.cur` and its `swBlink`; remove `.crumb` and `.crumb .ps` (the crumb is now rendered by TypedReveal). Keep all card/grid/filter visual styles.

The `[data-rise]` base opacity and cascade now come from `typedReveal.module.css`, so cards/lede/filters/foot are gated by the shared mechanism.

- [ ] **Step 3: Typecheck and test**

```bash
node_modules/.bin/tsc --noEmit
CI=true node_modules/.bin/vitest run
```

Expected: clean + green.

- [ ] **Step 4: Runtime check (work)**

Dev server on `:3001`, navigate to `/work`. After typing completes, every card/lede/filters/foot should be visible (`opacity: 1`). Strip the reveal-active class and confirm `[data-rise]` reads `0`. Change a filter chip and confirm cards do not violently re-flash (the cascade is a one-time entrance; new card mounts may animate once, which is acceptable — note if it looks wrong).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Migrate Work page to TypedReveal"
```

---

### Task 4: Migrate the Resume page (CareerLog)

**Files:**

- Modify: `src/components/holo/CareerLog.tsx`
- Modify: `src/components/holo/careerLog.module.css`

**Interfaces:**

- Consumes: `TypedReveal`, `TypedStep` from Task 1.
- Produces: nothing new.

- [ ] **Step 1: Replace the entrance state with TypedReveal steps**

In `src/components/holo/CareerLog.tsx`:

- Remove `TypedCrumb` import; add `import TypedReveal from "./TypedReveal";`.
- Delete the entrance state and orchestration: `summaryTyped`, `revealed`, `nodesIn`, `timersRef`, the `startReveal` function, and the unmount-timer `useEffect` that clears `timersRef`. Keep all interaction state (`expanded`, `shellFocused`, `input`, `output`, `history`, `histIdx`, `inputRef`) and the `entries` memo, `toggle`, `run`, `onKeyDown`, `showHint`.
- The `summary` is now a typed `line` step (keep `data.summary` for the shell's `whoami`).
- The shell no longer needs the `revealed`-gated `.in` class; it lives inside the reveal block which is hidden until active.
- Each timeline node gets `data-rise`; drop the `nodesIn`/`.nodeIn` gating. Drop the `revealed`/`.timelineIn` gating (the rail becomes always-on; see Step 2).

Return:

```tsx
return (
  <TypedReveal
    wide
    name={data.name}
    head={
      <div className={styles.head}>
        <h1 className={styles.title}>Resume</h1>
        <a className={styles.download} href={data.resumePdf} download>
          ↓ download résumé.pdf
        </a>
      </div>
    }
    steps={[
      { kind: "command", text: "cat resume.md" },
      {
        kind: "line",
        text: data.summary,
        speed: "fast",
        className: styles.summary,
      },
      {
        kind: "reveal",
        stagger: 500,
        node: (
          <>
            {/* interactive shell — always shown, cursor blinks only when focused */}
            <div
              className={`${styles.shell} ${shellFocused ? styles.shellFocused : ""}`}
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

            <div className={styles.timeline}>
              {entries.map((e, i) => {
                const open = expanded.has(i);
                const hasBody =
                  !!e.detail || e.highlights.length > 0 || e.tech.length > 0;
                return (
                  <div key={e.org + i} className={styles.node} data-rise>
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
                            {e.detail && (
                              <p className={styles.detail}>{e.detail}</p>
                            )}
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
          </>
        ),
      },
    ]}
  />
);
```

Remove the now-unused `useEffect` import if nothing else uses it (the unmount cleanup is gone; `useMemo`, `useRef`, `useState`, `KeyboardEvent` are still used — keep those; remove `useEffect`).

- [ ] **Step 2: Update careerLog.module.css**

- Make the rail always-on: find the `.timeline::before` rail rule and ensure its base `opacity` is `1` (remove any `opacity: 0`). Delete the `.timelineIn` / `.timeline.timelineIn::before` reveal rules.
- Delete the node entrance gating: the `.node { opacity: 0 ... }` base and `.nodeIn` rules and their keyframe (the cascade now comes from `[data-rise]` in `typedReveal.module.css`). Keep all node/card/pill/body visual styles.
- Delete the shell `.in` reveal rule (`.shell.in` / `.shell { opacity: 0 }` entrance); the shell is gated by the reveal block now. Keep `.shellFocused`, `.shellCur`, and all shell visual styles.
- Keep `.summary` (now applied via the `line` step's `className`), `.head`, `.title`, `.download`.

- [ ] **Step 3: Typecheck and test**

```bash
node_modules/.bin/tsc --noEmit
CI=true node_modules/.bin/vitest run
```

Expected: clean + green.

- [ ] **Step 4: Runtime verification (resume — the high-risk one)**

Dev server on `:3001`, navigate to `/resume`. Confirm by observation + console eval:

- `cat resume.md` types out (~1s); during typing, nodes/shell are hidden.
- Summary types fast after the command (~1.1s), styled as before (`.summary`).
- Shell + rail appear, then nodes cascade ~500ms apart.
- Shell still works: focus it, run `ls`, `whoami`, `help`, `download`, `clear`; arrow-up history; cursor blinks only when focused.
- Node expand/collapse (`▸`) still toggles.
- Reduced motion (emulate): everything visible immediately, no animation.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Migrate Resume page to TypedReveal"
```

---

### Task 5: Rebuild the 404 on TypedReveal

**Files:**

- Modify: `src/app/not-found.tsx`
- Modify: `src/components/NotFoundMessage.tsx`
- Modify: `src/app/not-found.module.css`
- Modify: `src/app/not-found.test.tsx`

**Interfaces:**

- Consumes: `TypedReveal` from Task 1.
- Produces: nothing new.

- [ ] **Step 1: Let NotFoundMessage forward DOM props**

In `src/components/NotFoundMessage.tsx`, change the props so `data-rise` (and any other DOM attributes) pass through to the `<p>`:

```tsx
type Props = React.ComponentPropsWithoutRef<"p">;

export default function NotFoundMessage(props: Props) {
  const [message] = useState(randomMessage);
  return (
    <p suppressHydrationWarning {...props}>
      {message}
    </p>
  );
}
```

(Keep the `"use client"`, the `messages` array, and `randomMessage`.)

- [ ] **Step 2: Rewrite not-found.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HoloFrame from "@/components/holo/HoloFrame";
import NotFoundMessage from "@/components/NotFoundMessage";
import TypedReveal from "@/components/holo/TypedReveal";
import styles from "./not-found.module.css";

export default function NotFound() {
  const pathname = usePathname();
  return (
    <HoloFrame>
      <TypedReveal
        steps={[
          { kind: "command", text: `cd .${pathname}` },
          {
            kind: "line",
            text: "cd: no such file or directory",
            tone: "error",
          },
          {
            kind: "reveal",
            node: (
              <div className={styles.block}>
                <h1 className={styles.code} data-rise>
                  404
                </h1>
                <NotFoundMessage className={styles.message} data-rise />
                <Link href="/" className={styles.back} data-rise>
                  Back to Home
                </Link>
              </div>
            ),
          },
        ]}
      />
    </HoloFrame>
  );
}
```

Note: `not-found.tsx` is now a client component (`usePathname`). The page metadata title still comes from the root layout template.

- [ ] **Step 3: Update not-found.module.css**

Keep the existing `.code`, `.message`, `.back` styles (cyan glow on `.code`, ghost button on `.back`). Replace the old centered `.wrap` (which TypedReveal's `.wrap` now owns) with a `.block` that centers the revealed content:

```css
.block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  padding: 40px 0 80px;
}
```

Remove the old `.wrap`/`.crumb`/`.ps`/`.err` rules (the crumb + error line are rendered by TypedReveal now). Keep `.code`, `.message`, `.back` (and `.back:hover`). The button label is the plain text "Back to Home".

- [ ] **Step 4: Update the test**

In `src/app/not-found.test.tsx`, add a `usePathname` mock and keep `HoloFrame` mocked:

```tsx
vi.mock("next/navigation", () => ({
  usePathname: () => "/some/missing/page",
}));
```

The existing three assertions (404 heading, "Page not found" message, link to `/`) remain valid. Because TypedReveal uses `matchMedia`, add a `matchMedia` stub in this test (reduced motion = true) so content renders synchronously:

```tsx
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      media: "",
      dispatchEvent: vi.fn(),
    })
  );
});
```

- [ ] **Step 5: Typecheck and test**

```bash
node_modules/.bin/tsc --noEmit
CI=true node_modules/.bin/vitest run src/app/not-found.test.tsx
```

Expected: clean + the 3 tests pass.

- [ ] **Step 6: Runtime check**

Dev server on `:3001`, navigate to `/some-random-bad-url`. Confirm the command types `cd ./some-random-bad-url`, then `cd: no such file or directory` types in the error color, then the 404 + message + "Back to Home" button reveal.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Rebuild 404 on TypedReveal with URL-aware command"
```

---

### Task 6: Delete TypedCrumb; final verification

**Files:**

- Delete: `src/components/holo/TypedCrumb.tsx`
- Delete: `src/components/holo/typedCrumb.module.css`

**Interfaces:**

- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Confirm TypedCrumb has no remaining importers**

Run: `grep -rn "TypedCrumb" src --include="*.tsx" --include="*.ts"`
Expected: no matches (all consumers migrated in Tasks 2–5). If any remain, migrate them before deleting.

- [ ] **Step 2: Delete TypedCrumb**

```bash
git rm src/components/holo/TypedCrumb.tsx src/components/holo/typedCrumb.module.css
```

- [ ] **Step 3: Full verification**

```bash
node_modules/.bin/tsc --noEmit
CI=true node_modules/.bin/vitest run
CI=true node_modules/.bin/next build
```

Expected: tsc clean, all tests green, build succeeds with all routes.

- [ ] **Step 4: Cross-page runtime sweep**

Dev server on `:3001`. For `/story`, `/life`, `/stack`, `/contact`, `/work`, `/resume`, a `/notes/<slug>`, a `/projects/<slug>`, and a bad URL: confirm the command types first and nothing in the gated sequence shows until it finishes, then the content cascades. Spot-check reduced motion on one page (everything visible, no animation).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Remove TypedCrumb; folded into TypedReveal"
```

---

## Self-Review

**Spec coverage:**

- TypedReveal API (head + steps, three step kinds) → Task 1. ✓
- Sequencing/gating contract → Task 1 (component logic) + shared CSS. ✓
- `data-rise` JS-assigned cascade, per-step stagger → Task 1 (`RevealBlock`). ✓
- Reduced motion → Task 1 (component short-circuit + CSS). ✓
- Migrate HoloReveal pages, delete HoloReveal, strip holoPage cascade → Task 2. ✓
- Work migration (cards data-rise, one-time cascade) → Task 3. ✓
- Resume migration (command/line/reveal, 500ms nodes, shell stays) → Task 4. ✓
- 404 (usePathname command, error line, Back to Home button, NotFoundMessage prop forwarding) → Task 5. ✓
- Delete TypedCrumb → Task 6. ✓
- Verification (tsc/vitest/build + runtime opacity) → every task + Task 6 sweep. ✓

**Refinement beyond the spec:** Added optional `className` to `command`/`line` steps (spec did not mention it) so the resume summary keeps `.summary` styling and the 404 error uses `tone:"error"`. Recorded here intentionally.

**Type consistency:** `TypedStep` and `TypedReveal` signatures are defined once in Task 1 and consumed verbatim in Tasks 2–5. `data-rise` attribute and `RevealBlock` querying match. Prompt derivation (`name.split(" ")[0].toLowerCase()`) matches the removed TypedCrumb. No naming drift found.

**Placeholder scan:** Page-migration steps that say "unchanged" refer to existing, already-written markup being preserved verbatim (ContactForm/channels block, note meta row, project image block); the changed lines (`data-rise`, import swap, steps array) are shown in full. No TBD/TODO left.
