# CTA Social Links Enhancement — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add social link icons to the "Want to work together?" CTA on the About page, replacing the need for a contact form.

**Architecture:** Reuse existing `SocialLinks` component with a new CSS class for CTA-specific layout. Read links from Keystatic `siteSettings` singleton (same data source as Footer).

**Tech Stack:** Next.js, CSS Modules, Keystatic

---

## Decision

Replace the contact form plan with social links in the existing CTA. No `/contact` page. No Resend integration.

## Design

```
┌─────────────────────────────────┐
│     Want to work together?      │
│   I take on select freelance... │
│       [GH]  [LI]  [IG]         │
└─────────────────────────────────┘
```

---

### Task 1: Add social links to About page CTA

**Files:**
- Modify: `src/app/(portfolio)/about/page.module.css`
- Modify: `src/app/(portfolio)/about/page.tsx`

**Step 1: Add `.ctaSocials` styles to CSS Module**

In `src/app/(portfolio)/about/page.module.css`, add after the `.ctaText` rule:

```css
.ctaSocials {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.ctaSocials a {
  color: var(--text-secondary);
  transition: color 0.2s ease;
  padding: 8px;
}

.ctaSocials a:hover {
  color: var(--accent);
}
```

**Step 2: Import SocialLinks and read settings in About page**

In `src/app/(portfolio)/about/page.tsx`:

1. Add import at top:
```tsx
import SocialLinks from "@/components/SocialLinks";
```

2. After the existing `about` read (line 24), add:
```tsx
const settings = await reader.singletons.siteSettings.read();
const socialLinks = (settings?.socialLinks ?? []).filter((l) => l.showInFooter);
```

3. Inside the `<section className={styles.cta}>`, after the `<p>` tag, add:
```tsx
<SocialLinks links={socialLinks} className={styles.ctaSocials} />
```

**Step 3: Verify visually**

Run: Visit `http://localhost:3001/about` and scroll to the CTA.
Expected: Three social icons centered below the paragraph, turning accent color on hover.

**Step 4: Commit**

```bash
git add src/app/\(portfolio\)/about/page.tsx src/app/\(portfolio\)/about/page.module.css
git commit -m "Add social links to About page CTA"
```

---

### Task 2: Clean up preview files

**Files:**
- Delete: `src/app/(portfolio)/cta-preview/page.tsx`
- Delete: `src/app/(portfolio)/cta-preview/page.module.css`
- Delete: `src/app/(portfolio)/cta-preview/` (directory)

**Step 1: Remove preview route**

```bash
rm -rf src/app/\(portfolio\)/cta-preview
```

**Step 2: Commit**

```bash
git commit -m "Remove CTA preview page"
```

---

### Task 3: Update TODO.md

**Files:**
- Modify: `TODO.md`

**Step 1: Update Resend and contact form items**

Replace the unchecked Resend/contact items with a note that social links replaced the contact form:

- Lines 18-20 (Resend setup): mark as N/A or replace
- Line 28 (test contact form sends email): mark as N/A or replace
- Line 35 (set env vars): remove `RESEND_API_KEY`, `CONTACT_EMAIL`
- Line 44 (test live contact form): mark as N/A or replace

**Step 2: Commit**

```bash
git add TODO.md
git commit -m "Update TODO: social links replace contact form"
```
