# Nav Hamburger Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add polished animations to the mobile nav: hamburger → X icon morph, smooth menu open/close, click-outside-to-close, and staggered link enter + hover/click effects.

**Architecture:** Pure CSS transitions + keyframes for all visual effects. Minimal JS additions to Nav.tsx (refs + useEffect for click-outside). No new dependencies.

**Tech Stack:** Next.js App Router, React, CSS Modules

---

### Task 1: Animate the hamburger icon bars → X

**Files:**
- Modify: `src/components/Nav.module.css`
- Modify: `src/components/Nav.tsx`

**Step 1: Add `.open` class to the toggle button in Nav.tsx**

In `src/components/Nav.tsx`, change the button's className from:

```tsx
<button
  className={styles.toggle}
  ...
>
```

to:

```tsx
<button
  className={`${styles.toggle}${mobileOpen ? ` ${styles.toggleOpen}` : ""}`}
  ...
>
```

**Step 2: Add the `.toggleOpen` bar styles to Nav.module.css**

Add these rules after the existing `.toggleBar` block (around line 108):

```css
/* Bars → X when open */
.toggleOpen .toggleBar:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}

.toggleOpen .toggleBar:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.toggleOpen .toggleBar:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}
```

**Step 3: Verify visually**

Run `pnpm dev`, open on mobile viewport (or use DevTools responsive mode at < 640px width), click the hamburger. The 3 bars should smoothly morph into an X over ~300ms. Click again — they should morph back.

**Step 4: Commit**

```bash
git add src/components/Nav.tsx src/components/Nav.module.css
git commit -m "animate hamburger icon bars to X on open"
```

---

### Task 2: Fix and polish the menu panel open/close animation

**Files:**
- Modify: `src/components/Nav.module.css`

**Context:** The current `.mobileMenu` uses `display: none` → `display: flex`. CSS transitions cannot animate `display`, so the `opacity`/`transform` transitions defined there never actually run — the menu snaps in/out instantly. The fix is to use `visibility` + `pointer-events` instead of `display`.

**Step 1: Replace the `.mobileMenu` and `.mobileMenu.open` blocks**

Find and replace the entire `.mobileMenu` block (lines ~110–131):

Old:
```css
.mobileMenu {
  display: none;
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: 24px;
  z-index: 99;
  flex-direction: column;
  gap: 20px;
  transform: translateY(-8px);
  opacity: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.mobileMenu.open {
  display: flex;
  transform: translateY(0);
  opacity: 1;
}
```

New:
```css
.mobileMenu {
  display: flex;
  flex-direction: column;
  visibility: hidden;
  pointer-events: none;
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: 24px;
  z-index: 99;
  gap: 20px;
  transform: translateY(-8px);
  opacity: 0;
  transition: transform 0.25s ease, opacity 0.25s ease, visibility 0s linear 0.25s;
}

.mobileMenu.open {
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
  opacity: 1;
  transition: transform 0.25s ease, opacity 0.25s ease, visibility 0s linear 0s;
}
```

The `visibility` transition trick: when closing, `visibility` delays its change until after the opacity/transform finish (delay = 0.25s). When opening, visibility flips immediately (delay = 0s) so the menu is visible before the fade starts.

**Step 2: Verify visually**

Run `pnpm dev` at < 640px. Click the hamburger — menu should slide down and fade in smoothly. Click again — it should fade out and slide up, then disappear (not snap). The transition should feel snappy but not abrupt (~250ms).

**Step 3: Commit**

```bash
git add src/components/Nav.module.css
git commit -m "fix menu panel open/close animation using visibility trick"
```

---

### Task 3: Close menu when clicking outside

**Files:**
- Modify: `src/components/Nav.tsx`

**Step 1: Add refs to Nav.tsx**

Import `useRef` (add it to the existing React import) and create two refs:

```tsx
import { useState, useEffect, useId, useRef } from "react";

// Inside the Nav() component, alongside existing state:
const navRef = useRef<HTMLElement>(null);
const menuRef = useRef<HTMLDivElement>(null);
```

**Step 2: Attach refs to the JSX elements**

Add `ref={navRef}` to the `<nav>` element:

```tsx
<nav
  ref={navRef}
  className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}
  aria-label="Main navigation"
>
```

Add `ref={menuRef}` to the mobile menu `<div>`:

```tsx
<div
  ref={menuRef}
  id={menuId}
  className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`}
>
```

**Step 3: Add click-outside useEffect**

Add this effect after the existing `useEffect` hooks:

```tsx
useEffect(() => {
  if (!mobileOpen) return;

  const handleClickOutside = (e: MouseEvent) => {
    if (
      navRef.current &&
      menuRef.current &&
      !navRef.current.contains(e.target as Node) &&
      !menuRef.current.contains(e.target as Node)
    ) {
      setMobileOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [mobileOpen]);
```

**Step 4: Verify visually**

Run `pnpm dev` at < 640px. Open the menu, then click anywhere on the page content outside the nav/menu — it should close. Clicking inside the menu or on the nav itself should not close it.

**Step 5: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "close mobile menu on outside click"
```

---

### Task 4: Add link stagger, hover nudge, and click press animations

**Files:**
- Modify: `src/components/Nav.module.css`

**Step 1: Add the `@keyframes` animation**

Add this at the top of `Nav.module.css` (before `.nav`):

```css
@keyframes slideInLink {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

**Step 2: Update `.mobileMenu a` with hover nudge, active press, and transition**

Replace the existing `.mobileMenu a` block with:

```css
.mobileMenu a {
  font-size: 16px;
  font-weight: 400;
  color: var(--text-secondary);
  text-decoration: none;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  min-height: 44px;
  display: flex;
  align-items: center;
  transition: color 0.2s ease, transform 0.2s ease;
}

.mobileMenu a:hover {
  transform: translateX(4px);
}

.mobileMenu a:active {
  transform: scale(0.97);
}
```

**Step 3: Add stagger animation to links when menu is open**

Add these rules after the `.mobileMenu a:active` block:

```css
.mobileMenu.open a {
  animation: slideInLink 0.3s ease forwards;
}

.mobileMenu.open a:nth-child(1) { animation-delay: 0ms; }
.mobileMenu.open a:nth-child(2) { animation-delay: 60ms; }
.mobileMenu.open a:nth-child(3) { animation-delay: 120ms; }
.mobileMenu.open a:nth-child(4) { animation-delay: 180ms; }
.mobileMenu.open a:nth-child(5) { animation-delay: 240ms; }
```

**Note:** The stagger uses `nth-child` with a 60ms gap. Each link will cascade in from the left as the menu opens.

**Step 4: Verify visually**

Run `pnpm dev` at < 640px. Open the menu — links should stagger in (each slightly after the previous). Hover over links — they should nudge right 4px. Click/tap a link — it should briefly scale down (0.97) before navigating.

**Step 5: Commit**

```bash
git add src/components/Nav.module.css
git commit -m "add stagger, hover nudge, and press animations to mobile nav links"
```

---

## Done

All four tasks complete. The mobile nav now has:
- Hamburger bars morphing to X on open
- Smooth fade+slide menu panel with correct visibility handling
- Click-outside-to-close behavior
- Staggered link entry + hover nudge + click press effects
