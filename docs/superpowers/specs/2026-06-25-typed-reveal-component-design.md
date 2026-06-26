# TypedReveal — unified terminal type-out + reveal component

**Date:** 2026-06-25
**Branch:** holo-terminal-redesign
**Status:** Approved design, pending implementation plan

## Problem

The "type a terminal command, then reveal the content below it" entrance is
implemented three different ways:

- `HoloReveal` gates a `.rise` cascade defined in `holoPage.module.css`.
- `SelectedWork` gates its own `.lede/.filters/.card/.foot` opacity rules.
- `CareerLog` (resume) hand-rolls `summaryTyped`/`revealed`/`nodesIn` state.

The gating mechanism (base `opacity`, the `.play` trigger, the keyframes) is
duplicated across CSS modules. The same `opacity: 1` base bug — content visible
during type-out, then a flash when the rise animation fired — appeared
independently in `holoPage` and `selectedWork`. There is no single place to
change entrance behavior, and adding a second typed section to any page would
mean copying the pattern again.

The new 404 requirement (type the URL the user entered, then type an error line,
then reveal) is a second multi-step typed sequence, alongside the resume. That
makes a shared, sequence-aware primitive worth building now — not for a
hypothetical future, but to remove duplication that already exists and has
already caused bugs.

## Goal

One component that owns the typed-sequence-then-reveal contract end to end, so:

- The gating mechanism is defined once and cannot regress per page.
- Multi-step typed sequences (404, resume) and single-command pages (story,
  work, etc.) share the same shape.
- Future typed sections drop in by adding the component, not copying CSS.

Non-goals: changing the visual design, the interactive resume shell behavior, or
any page's content. This is a structural consolidation of the _entrance_.

## Component API

New client component `src/components/holo/TypedReveal.tsx` with its own
`typedReveal.module.css`.

```tsx
<TypedReveal
  name={name} // drives the prompt label: <first>@adkins:~$
  wide={false} // existing holoPage layout width flag
  amber={false} // existing Life-side accent flip
  head={<TitleBlock />} // optional; ALWAYS visible immediately (persistent frame)
  steps={steps} // ordered, gated sequence
/>
```

### Step model

```ts
type TypedStep =
  | { kind: "command"; text: string }
  | { kind: "line"; text: string; tone?: "error"; speed?: "normal" | "fast" }
  | { kind: "reveal"; node: React.ReactNode; stagger?: number };
```

- `command` — renders the prompt (`<first>@adkins:~$ `) followed by `text`
  typed out over ~1s; a cursor blinks while typing and is removed when done.
- `line` — typed text with no prompt (terminal output), and no cursor (matches
  the resume summary today). `tone: "error"` renders in the error color.
  `speed: "fast"` types the whole string in ~1.1s regardless of length (the
  resume summary case); default `normal` matches the command cadence.
- `reveal` — a content block. Sits in the DOM the entire time (hidden) for SEO
  and to avoid layout shift; becomes visible on its turn and cascades any
  `[data-rise]` descendants. `stagger` is the per-element delay in ms
  (default ~70; resume timeline uses ~500).

### Sequencing contract

- Steps run strictly in order. Step _n_ does not begin until step _n−1_ reports
  done.
- `head` renders immediately and is never gated (matches the resume reference,
  where the "Resume" title + download button show alongside the crumb).
- Everything in `steps` is hidden until its turn. `reveal` content is present
  but `opacity: 0` until activated, so crawlers see it and the layout is stable.
- Reduced motion: skip typing (show final text immediately), reveal everything
  at once, no cascade. The reduced-motion branch must force `opacity: 1` on
  gated elements so disabled animations never leave content stuck hidden.

### Cascade targeting

The component owns the cascade _mechanism_ (keyframes, base `opacity: 0`, the
activation trigger, reduced-motion handling). Pages declare _which_ elements
stagger by adding `data-rise` to them, wherever they live in the reveal subtree:

- Story: `data-rise` on the top-level blocks (lede, sections, cta, foot).
- Work: `data-rise` on each `.card` (nested in `.grid`), not the grid wrapper.
- Resume: `data-rise` on each timeline node, with the step's `stagger: 500`.

Mechanism: CSS sets `[data-rise] { opacity: 0 }` as the always-on base. When a
reveal step activates, the component queries its container for `[data-rise]`
elements (in document order) and sets each one's inline `animation-delay` to
`index * stagger` ms; an `active` class on the container triggers the rise
keyframe (`both` fill, so the final state holds). This is used instead of CSS
`nth-child` so the stagger works regardless of element depth or non-rise
siblings, and so the per-step `stagger` interval (e.g. 500ms for resume) is
exact. Document order across the whole reveal subtree is intentional — nested
groups still cascade in reading order.

A reveal's cascade fires once on entrance. For pages whose children re-render
after entrance (work's filter chips remount cards), the animation must not
replay on those later mounts — the cascade is tied to the one-time activation,
not to element mount.

## Migration map

| File                                                                                     | Change                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TypedReveal.tsx` (new)                                                                  | The component; runs steps, owns gating.                                                                                                                                     |
| `typedReveal.module.css` (new)                                                           | Typing styles, `[data-rise]` cascade keyframes, reduced-motion. Single source of truth.                                                                                     |
| `TypedCrumb.tsx`                                                                         | Folded into TypedReveal as the `command`/`line` renderer. Standalone usage removed.                                                                                         |
| `HoloReveal.tsx`                                                                         | Deleted; replaced by TypedReveal.                                                                                                                                           |
| `holoPage.module.css`                                                                    | Remove `.rise`/`.play` cascade rules (now in the component). Keep all other styles.                                                                                         |
| `selectedWork.module.css`                                                                | Remove the `.lede/.filters/.card/.foot` opacity gating; cards get `data-rise`. Keep visual styles.                                                                          |
| `SelectedWork.tsx`                                                                       | Use TypedReveal with `steps`; tag cards `data-rise`.                                                                                                                        |
| `CareerLog.tsx`                                                                          | Replace `summaryTyped`/`revealed`/`nodesIn` + `startReveal` with `steps`. Interactive shell + timeline stay; nodes get `data-rise` at 500ms; title/download stay in `head`. |
| `careerLog.module.css`                                                                   | Remove entrance `.in`/`.timelineIn`/`.nodeIn` gating; keep visual styles.                                                                                                   |
| `story`, `life`, `stack`, `contact`, `notes`, `notes/[slug]`, `projects/[slug]` page.tsx | Swap `HoloReveal` → `TypedReveal` with a `steps` array; replace `${page.rise}` classes with `data-rise`.                                                                    |
| `not-found.tsx`                                                                          | Becomes a client component (`usePathname`); rebuilt on TypedReveal (see below).                                                                                             |

## The new 404

`not-found.tsx` reads the attempted path with `usePathname()` and types it as the
command, then types the error line, then reveals the 404 block with a plain
labeled button (no `cd` jargon, for non-technical visitors).

```tsx
const pathname = usePathname();

<TypedReveal
  name={name}
  steps={[
    { kind: "command", text: `cd .${pathname}` },
    { kind: "line", text: "cd: no such file or directory", tone: "error" },
    {
      kind: "reveal",
      node: (
        <>
          <h1 data-rise>404</h1>
          <NotFoundMessage data-rise />
          <Link href="/" data-rise>
            Back to Home
          </Link>
        </>
      ),
    },
  ]}
/>;
```

- The command shows the real URL the user hit (`cd ./some/bad/path`).
- The witty randomized message (`NotFoundMessage`) is retained.
- The link is a standard "Back to Home" button, styled as the existing ghost
  button — no terminal command as the label.

`NotFoundMessage` must forward `data-rise` (and any DOM props) to its rendered
element so it participates in the cascade.

## Page step recipes (reference)

```tsx
// story
head={<TitleBlock/>}
steps={[
  { kind: "command", text: "cat story.md" },
  { kind: "reveal", node: <>{/* lede + sections + cta + foot, each data-rise */}</> },
]}

// work
head={<WorkTitle/>}
steps={[
  { kind: "command", text: "ls work/" },
  { kind: "reveal", node: <>{/* lede, filters, grid(cards data-rise), foot */}</> },
]}

// resume
head={<ResumeTitleAndDownload/>}
steps={[
  { kind: "command", text: "cat resume.md" },
  { kind: "line", text: summary, speed: "fast" },
  { kind: "reveal", stagger: 500, node: <>{/* timeline(nodes data-rise) + shell */}</> },
]}
```

## Risks

- **Resume regression.** Resume is a working, complex feature (slow node
  cascade + interactive shell + summary typing). Verify the migrated entrance
  live (typing, summary, 500ms cascade, shell focus/blink) before committing.
- **Work filter re-animation.** Filter changes remount cards; ensure the
  cascade fires only on the one-time entrance activation, not on later mounts.
- **`line` step typing speed.** The resume summary must still finish in ~1.1s
  regardless of length; preserve the existing chunked-typing math in the `fast`
  path.

## Verification

- `tsc --noEmit` clean; `vitest run` green; `next build` green.
- Per page, confirm at runtime: during the typed sequence all gated content is
  `opacity: 0`; after the last typed step, content cascades in. (The
  strip-`.play` / read computed `opacity` check used during the earlier fix
  works here too.)
- Reduced-motion: content is fully visible, no animation.
- 404: visiting an arbitrary bad URL types that exact path.
