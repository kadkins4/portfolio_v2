# Social Links Icons Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hardcoded text social links with CMS-managed icon links, add them to the Contact page, and make the "Available for work" badge link to /contact.

**Architecture:** Add a `siteSettings` Keystatic singleton to manage social link data (platform, URL, placement flags). A shared `SocialLinks` server component reads the pre-filtered list and renders inline SVG icons. The Contact page is split into a server wrapper (reads data) and a client form component (handles state).

**Tech Stack:** Next.js 16 App Router, Keystatic 0.5.x (`@keystatic/core`), React 19, CSS Modules, Vitest + @testing-library/react

---

### Task 1: Add `siteSettings` singleton to Keystatic config

**Files:**
- Modify: `keystatic.config.ts`

**Step 1: Add the singleton schema**

Open `keystatic.config.ts` and add `siteSettings` to the `singletons` object:

```ts
siteSettings: singleton({
  label: "Site Settings",
  path: "content/site-settings",
  schema: {
    socialLinks: fields.array(
      fields.object({
        platform: fields.select({
          label: "Platform",
          options: [
            { label: "GitHub", value: "github" },
            { label: "Instagram", value: "instagram" },
            { label: "Reddit", value: "reddit" },
            { label: "LinkedIn", value: "linkedin" },
            { label: "Email", value: "email" },
          ],
          defaultValue: "github",
        }),
        url: fields.text({ label: "URL / email address" }),
        showInFooter: fields.checkbox({ label: "Show in footer", defaultValue: true }),
        showInContact: fields.checkbox({ label: "Show on contact page", defaultValue: true }),
      }),
      {
        label: "Social Links",
        itemLabel: (props) => props.fields.platform.value ?? "Link",
      }
    ),
  },
}),
```

The final `singletons` block will have three keys: `home`, `about`, `siteSettings`.

**Step 2: Commit**

```bash
git add keystatic.config.ts
git commit -m "add siteSettings singleton to keystatic config"
```

---

### Task 2: Seed `content/site-settings.yaml`

Keystatic stores singletons at `<path>.yaml` (or `.json` — it uses YAML by default for local storage).

**Files:**
- Create: `content/site-settings.yaml`

**Step 1: Create the seed file**

```yaml
socialLinks:
  - platform: github
    url: "https://github.com"
    showInFooter: true
    showInContact: true
  - platform: instagram
    url: "https://instagram.com"
    showInFooter: true
    showInContact: true
  - platform: reddit
    url: "https://reddit.com"
    showInFooter: true
    showInContact: true
  - platform: linkedin
    url: "https://linkedin.com"
    showInFooter: true
    showInContact: true
  - platform: email
    url: "hello@kendalladkins.com"
    showInFooter: true
    showInContact: true
```

**Step 2: Verify by running the dev server briefly**

```bash
bun dev
```

Open http://localhost:3000/keystatic and confirm "Site Settings" appears in the sidebar with the 5 social links.

**Step 3: Commit**

```bash
git add content/site-settings.yaml
git commit -m "seed site settings with social links"
```

---

### Task 3: Create `SocialLinks` component + test

**Files:**
- Create: `src/components/SocialLinks.tsx`
- Create: `src/components/SocialLinks.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/components/SocialLinks.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SocialLinks from "./SocialLinks";

const links = [
  { platform: "github" as const, url: "https://github.com/test", showInFooter: true, showInContact: true },
  { platform: "email" as const, url: "test@example.com", showInFooter: true, showInContact: true },
];

describe("SocialLinks", () => {
  it("renders one link per entry", () => {
    render(<SocialLinks links={links} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("uses mailto: prefix for email platform", () => {
    render(<SocialLinks links={links} />);
    const emailLink = screen.getByLabelText("Email");
    expect(emailLink).toHaveAttribute("href", "mailto:test@example.com");
  });

  it("renders non-email links with url as-is", () => {
    render(<SocialLinks links={links} />);
    const githubLink = screen.getByLabelText("GitHub");
    expect(githubLink).toHaveAttribute("href", "https://github.com/test");
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun test SocialLinks
```

Expected: FAIL — "Cannot find module './SocialLinks'"

**Step 3: Create the component**

```tsx
// src/components/SocialLinks.tsx

type Platform = "github" | "instagram" | "reddit" | "linkedin" | "email";

export type SocialLink = {
  platform: Platform;
  url: string;
  showInFooter: boolean;
  showInContact: boolean;
};

const LABELS: Record<Platform, string> = {
  github: "GitHub",
  instagram: "Instagram",
  reddit: "Reddit",
  linkedin: "LinkedIn",
  email: "Email",
};

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

const ICONS: Record<Platform, () => JSX.Element> = {
  github: GitHubIcon,
  instagram: InstagramIcon,
  reddit: RedditIcon,
  linkedin: LinkedInIcon,
  email: EmailIcon,
};

type Props = {
  links: SocialLink[];
  className?: string;
};

export default function SocialLinks({ links, className }: Props) {
  return (
    <nav aria-label="Social links" className={className}>
      {links.map(({ platform, url }) => {
        const href = platform === "email" ? `mailto:${url}` : url;
        const Icon = ICONS[platform];
        return (
          <a
            key={platform}
            href={href}
            aria-label={LABELS[platform]}
            target={platform !== "email" ? "_blank" : undefined}
            rel={platform !== "email" ? "noopener noreferrer" : undefined}
          >
            <Icon />
          </a>
        );
      })}
    </nav>
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
bun test SocialLinks
```

Expected: PASS — 3 tests passing

**Step 5: Commit**

```bash
git add src/components/SocialLinks.tsx src/components/SocialLinks.test.tsx
git commit -m "add SocialLinks component with inline SVG icons"
```

---

### Task 4: Update Footer to use `SocialLinks`

**Files:**
- Modify: `src/components/Footer.tsx`

The Footer is currently a synchronous server component with hardcoded links. Make it async, read from Keystatic, filter by `showInFooter`, and render `<SocialLinks>`.

**Step 1: Rewrite Footer**

```tsx
// src/components/Footer.tsx
import { createReader } from "@keystatic/core/reader";
import config from "../../keystatic.config";
import SocialLinks from "./SocialLinks";

const CURRENT_YEAR = new Date().getFullYear();

export default async function Footer() {
  const reader = createReader(process.cwd(), config);
  const settings = await reader.singletons.siteSettings.read();
  const links = (settings?.socialLinks ?? []).filter((l) => l.showInFooter);

  return (
    <footer className="footer-wrapper">
      <SocialLinks links={links} className="footer-links-nav" />
    </footer>
  );
}
```

Note: the `className="footer-links-nav"` preserves the existing CSS class on the `<nav>` inside `SocialLinks`. However, `SocialLinks` applies `className` to the `<nav>` element directly — which is correct since the old markup was `<nav className="footer-links-nav">`.

**Step 2: Verify visually**

```bash
bun dev
```

Open http://localhost:3000 and confirm the footer shows 5 icon links instead of text.

**Step 3: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "update footer to use CMS-managed SocialLinks with icons"
```

---

### Task 5: Split Contact page into server wrapper + client form

The current `contact/page.tsx` is `"use client"` (needs `useState`). To read Keystatic data server-side, extract the form into its own client component.

**Files:**
- Create: `src/app/(portfolio)/contact/ContactForm.tsx`
- Modify: `src/app/(portfolio)/contact/page.tsx`

**Step 1: Create `ContactForm.tsx`**

Move all the existing `page.tsx` content (except the outer `section-wrapper` div and header) into a new file:

```tsx
// src/app/(portfolio)/contact/ContactForm.tsx
"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="website"
        className={styles.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>Name</label>
        <input id="name" name="name" type="text" required className={styles.input} autoComplete="name" aria-required="true" />
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input id="email" name="email" type="email" required className={styles.input} autoComplete="email" aria-required="true" />
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>Message</label>
        <textarea id="message" name="message" required className={styles.textarea} rows={5} aria-required="true" />
      </div>

      <button type="submit" disabled={status === "loading"} className={styles.submit}>
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>

      {status === "success" && (
        <p className={styles.success} role="status">Message sent! I&#39;ll get back to you soon.</p>
      )}
      {status === "error" && (
        <p className={styles.error} role="alert">Something went wrong. Please try again or email me directly.</p>
      )}
    </form>
  );
}
```

**Step 2: Rewrite `page.tsx` as a server component**

```tsx
// src/app/(portfolio)/contact/page.tsx
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import SocialLinks from "@/components/SocialLinks";
import ContactForm from "./ContactForm";
import styles from "./page.module.css";

export default async function ContactPage() {
  const reader = createReader(process.cwd(), config);
  const settings = await reader.singletons.siteSettings.read();
  const links = (settings?.socialLinks ?? []).filter((l) => l.showInContact);

  return (
    <div className="section-wrapper">
      <p className="section-label">Contact</p>
      <h1 className="section-title">Get in touch.</h1>
      <SocialLinks links={links} className={styles.socialLinks} />
      <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
        Have a project in mind or just want to say hello? I&#39;d love to hear from you.
      </p>
      <ContactForm />
    </div>
  );
}
```

**Step 3: Add `.socialLinks` style to `page.module.css`**

Add at the bottom of `src/app/(portfolio)/contact/page.module.css`:

```css
.socialLinks {
  display: flex;
  gap: 16px;
  margin: 16px 0 24px;
}

.socialLinks a {
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.socialLinks a:hover {
  color: var(--accent);
}
```

**Step 4: Verify**

```bash
bun dev
```

Open http://localhost:3000/contact. Confirm icons appear below the heading and above the intro paragraph.

**Step 5: Commit**

```bash
git add src/app/(portfolio)/contact/ContactForm.tsx src/app/(portfolio)/contact/page.tsx src/app/(portfolio)/contact/page.module.css
git commit -m "add social link icons to contact page header"
```

---

### Task 6: Make "Available for work" badge link to /contact

**Files:**
- Modify: `src/app/(portfolio)/page.tsx`
- Modify: `src/app/(portfolio)/page.module.css`

**Step 1: Wrap the badge in a Link**

In `src/app/(portfolio)/page.tsx`, replace the `<span className={styles.badge}>` with a `<Link>`:

```tsx
// Before:
<span className={styles.badge}>
  <span className={styles.badgeDot} aria-hidden="true" />
  {home?.badge ?? "Available for work"}
</span>

// After:
<Link href="/contact" className={styles.badge}>
  <span className={styles.badgeDot} aria-hidden="true" />
  {home?.badge ?? "Available for work"}
</Link>
```

`Link` is already imported in this file.

**Step 2: Add hover style to `.badge` in `page.module.css`**

Add after the existing `.badge` block:

```css
.badge:hover {
  border-color: var(--accent);
  background: var(--accent-glow);
}
```

**Step 3: Verify**

```bash
bun dev
```

Open http://localhost:3000. Click the "Available for work" badge — it should navigate to /contact.

**Step 4: Run all tests**

```bash
bun test
```

Expected: all existing tests + SocialLinks tests pass.

**Step 5: Commit**

```bash
git add src/app/(portfolio)/page.tsx src/app/(portfolio)/page.module.css
git commit -m "make available for work badge link to contact page"
```
