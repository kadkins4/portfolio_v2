# Nav Hamburger Menu Animation Design

**Date:** 2026-02-26

## Overview

Add polished animation to the mobile nav hamburger menu: icon morphing, smooth panel open/close, click-outside-to-close, and link hover/click/stagger animations. Pure CSS + minimal JS — no new dependencies.

## Components Affected

- `src/components/Nav.tsx`
- `src/components/Nav.module.css`

## Feature Breakdown

### 1. Hamburger Icon — Bars → X

Three `<span>` bars already have `transition: all 0.3s ease`. Add a `.open` class to the `.toggle` button and target each bar with `:nth-child` selectors:

- **Top bar**: `translateY(6.5px) rotate(45deg)`
- **Middle bar**: `opacity: 0; transform: scaleX(0)`
- **Bottom bar**: `translateY(-6.5px) rotate(-45deg)`

No inline styles — all driven by the `.toggle.open` CSS class.

### 2. Menu Panel — Smooth Open/Close

**Problem:** The current `display: none` → `display: flex` swap breaks CSS transitions because `display` is not animatable.

**Fix:** Replace with `visibility: hidden; pointer-events: none` in the closed state. `opacity` and `transform: translateY(-8px)` transitions already defined in `.mobileMenu` will now actually animate. Open state: `visibility: visible; pointer-events: auto; opacity: 1; transform: translateY(0)`.

### 3. Click Outside to Close

Add `useRef` refs to the `<nav>` and the mobile menu `<div>`. In a `useEffect` (gated on `mobileOpen === true`), attach a `mousedown` listener to `document`. If the click target is outside both refs, call `setMobileOpen(false)`. Clean up the listener on effect teardown.

### 4. Link Animations

- **Hover**: existing color → `--accent` + new `transform: translateX(4px)` nudge with `transition: color 0.2s ease, transform 0.2s ease`
- **Active/click**: `transform: scale(0.97)` on `:active`
- **Stagger entry**: CSS `@keyframes slideInLink` (opacity 0→1, translateX -8px→0). Each link (`nth-child` 1–5) gets a progressively larger `animation-delay` (0ms, 60ms, 120ms, 180ms, 240ms). Animation only runs when `.open` is active.

## Non-Goals

- No Framer Motion or other animation libraries
- No changes to desktop nav links
- No changes to the scroll/scrolled behavior
