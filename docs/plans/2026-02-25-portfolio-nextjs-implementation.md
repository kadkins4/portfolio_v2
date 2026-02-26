# Portfolio Next.js Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate `portfolio.jsx` to a multi-page Next.js 15 site with Keystatic CMS, mobile-first design, full SEO, and Vercel deployment.

**Architecture:** App Router with static site generation — every page pre-renders to HTML at build time. Keystatic manages content as markdown files in the repo, exposed via an admin UI at `/keystatic`. CSS Modules for scoped component styles, globals for theme variables.

**Tech Stack:** Next.js 15, TypeScript, Keystatic, CSS Modules, next/font, next/image, next-sitemap, Resend

**Design doc:** `docs/plans/2026-02-25-portfolio-refactor-design.md`

---

## Phase 1: Project Scaffold

### Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `src/` tree

**Step 1: Archive existing file**

```bash
mkdir -p archive && mv portfolio.jsx archive/portfolio.jsx.bak
```

**Step 2: Scaffold Next.js**

```bash
npx create-next-app@latest . \
  --typescript \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-tailwind
```

Answer the prompts:
- Would you like to use Turbopack? → **No** (Keystatic needs standard webpack)

**Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Server running at `http://localhost:3000`, default Next.js page visible.

**Step 4: Commit**

```bash
git add -A && git commit -m "scaffold next.js project"
```

---

### Task 2: Install dependencies

**Step 1: Install all dependencies**

```bash
npm install @keystatic/core @keystatic/next resend next-sitemap
```

**Step 2: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/dom jsdom
```

**Step 3: Verify installs**

```bash
npm ls @keystatic/core resend next-sitemap vitest
```

Expected: All packages listed without errors.

**Step 4: Commit**

```bash
git add package.json package-lock.json && git commit -m "add dependencies"
```

---

### Task 3: Configure next.config.ts

**Files:**
- Modify: `next.config.ts`

**Step 1: Replace default config**

```ts
// next.config.ts
import type { NextConfig } from "next";
import { withKeystaticConfig } from "@keystatic/next";

const nextConfig: NextConfig = {
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withKeystaticConfig(nextConfig);
```

**Step 2: Verify build still works**

```bash
npm run build
```

Expected: Build completes without errors.

**Step 3: Commit**

```bash
git add next.config.ts && git commit -m "configure next with keystatic"
```

---

### Task 4: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test script)

**Step 1: Create vitest config**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 2: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Verify vitest runs**

```bash
npm test
```

Expected: "No test files found" (that's fine — no tests yet).

**Step 4: Commit**

```bash
git add vitest.config.ts package.json && git commit -m "configure vitest"
```

---

## Phase 2: Global Styles & Theme

### Task 5: Set up global CSS and theme

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Replace globals.css with theme variables and base reset**

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

/* NOTE: Fonts are imported here for now. Task 9 migrates to next/font. */

:root {
  --bg:            #06060e;
  --bg-surface:    #0c0c18;
  --bg-card:       #10101f;
  --border:        #1a1a2e;
  --text-primary:  #e8e8f0;
  --text-secondary:#8888a8;
  --text-muted:    #6e6e90; /* lightened from #555570 for WCAG AA */
  --accent:        #00d4ff;
  --accent-dim:    #00d4ff33;
  --accent-glow:   #00d4ff18;
  --grad-from:     #00d4ff;
  --grad-to:       #7b61ff;
}

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 300;
  font-size: 16px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: var(--accent-dim);
  color: var(--accent);
}

*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

::selection {
  background: var(--accent-dim);
  color: var(--accent);
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  padding: 8px 16px;
  background: var(--accent);
  color: var(--bg);
  border-radius: 4px;
  font-size: 14px;
  z-index: 200;
  text-decoration: none;
}

.skip-link:focus {
  top: 8px;
}

/* Shared section layout */
.section-wrapper {
  padding: 120px 24px 80px;
  max-width: 900px;
  margin: 0 auto;
}

/* Shared typography helpers */
.section-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 16px;
}

.section-title {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: clamp(28px, 5vw, 40px);
  letter-spacing: -0.02em;
  margin-bottom: 24px;
  line-height: 1.15;
}

/* Animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(-20px, 20px); }
}

.fade-in {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
  .fade-in { opacity: 1; transform: none; }
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css && git commit -m "add global styles and theme"
```

---

## Phase 3: Core Layout Components

### Task 6: Create Nav component

**Files:**
- Create: `src/components/Nav.tsx`
- Create: `src/components/Nav.module.css`

**Step 1: Create Nav CSS module**

```css
/* src/components/Nav.module.css */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(6, 6, 14, 0.8);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border-bottom: 1px solid var(--border);
  transition: box-shadow 0.3s ease;
}

.scrolled {
  box-shadow: 0 4px 30px rgba(6, 6, 14, 0.5);
}

.logo {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  text-decoration: none;
}

.logoAccent {
  background: linear-gradient(135deg, var(--grad-from), var(--grad-to));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.links {
  display: none;
  gap: 32px;
  list-style: none;
}

@media (min-width: 640px) {
  .links { display: flex; }
}

.links a {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-secondary);
  text-decoration: none;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  position: relative;
  transition: color 0.3s ease;
  /* minimum touch target */
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--grad-from), var(--grad-to));
  transition: width 0.3s ease;
}

.links a:hover,
.links a.active {
  color: var(--accent);
}

.links a:hover::after,
.links a.active::after {
  width: 100%;
}

/* Mobile toggle */
.toggle {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .toggle { display: none; }
}

.toggleBar {
  width: 22px;
  height: 1.5px;
  background: var(--text-secondary);
  transition: all 0.3s ease;
  display: block;
}

/* Mobile menu */
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
}

.mobileMenu a:hover,
.mobileMenu a.active {
  color: var(--accent);
}
```

**Step 2: Create Nav component**

```tsx
// src/components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useId } from "react";
import styles from "./Nav.module.css";

const NAV_LINKS = [
  { href: "/", label: "home" },
  { href: "/about", label: "about" },
  { href: "/projects", label: "projects" },
  { href: "/blog", label: "blog" },
  { href: "/contact", label: "contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}
        aria-label="Main navigation"
      >
        <Link href="/" className={styles.logo}>
          K<span className={styles.logoAccent}>.</span>
        </Link>

        <ul className={styles.links}>
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={pathname === href ? styles.active : ""}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className={styles.toggle}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls={menuId}
        >
          <span className={styles.toggleBar} />
          <span className={styles.toggleBar} />
          <span className={styles.toggleBar} />
        </button>
      </nav>

      <div
        id={menuId}
        className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`}
      >
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? styles.active : ""}
          >
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/ && git commit -m "add Nav component"
```

---

### Task 7: Create Footer component

**Files:**
- Create: `src/components/Footer.tsx`
- Create: `src/components/Footer.module.css`

**Step 1: Create Footer CSS module**

```css
/* src/components/Footer.module.css */
.footer {
  padding: 48px 24px;
  text-align: center;
  border-top: 1px solid var(--border);
  margin-top: 80px;
}

.links {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.links a {
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.3s ease;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.links a:hover {
  color: var(--accent);
}

.copy {
  font-size: 12px;
  color: var(--text-muted);
}
```

**Step 2: Create Footer component**

```tsx
// src/components/Footer.tsx
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <nav aria-label="Social links" className="footer-links-nav">
        <a href="https://github.com/kendalladkins" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="https://linkedin.com/in/kendalladkins" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href="mailto:hello@kendalladkins.com">Email</a>
      </nav>
      <p className="footer-copy">© {CURRENT_YEAR} Kendall Adkins. Built with care.</p>
    </footer>
  );
}
```

NOTE: Update the GitHub/LinkedIn URLs to your actual profile URLs.

**Step 3: Add footer styles to globals.css**

Append to `src/app/globals.css`:

```css
/* Footer */
.footer-wrapper {
  padding: 48px 24px;
  text-align: center;
  border-top: 1px solid var(--border);
  margin-top: 80px;
}

.footer-links-nav {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.footer-links-nav a {
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.3s ease;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.footer-links-nav a:hover { color: var(--accent); }

.footer-copy {
  font-size: 12px;
  color: var(--text-muted);
}
```

**Step 4: Commit**

```bash
git add src/components/Footer.tsx src/app/globals.css && git commit -m "add Footer component"
```

---

### Task 8: Create root layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Replace default layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Kendall Adkins — Senior Front End Engineer",
    template: "%s | Kendall Adkins",
  },
  description:
    "Senior Front End Engineer crafting performant, accessible, and visually refined interfaces for the modern web.",
  metadataBase: new URL("https://kendalladkins.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kendalladkins.com",
    siteName: "Kendall Adkins",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@kendalladkins",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

NOTE: Replace `kendalladkins.com` with your actual domain, and `@kendalladkins` with your Twitter handle (or remove the twitter block if not applicable).

**Step 2: Verify the layout renders**

```bash
npm run dev
```

Visit `http://localhost:3000` — expect Nav and Footer visible around the default page content.

**Step 3: Commit**

```bash
git add src/app/layout.tsx && git commit -m "add root layout with nav and footer"
```

---

### Task 9: Migrate to next/font

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: Update layout.tsx to use next/font**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // ... same as Task 8
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

**Step 2: Update globals.css to use CSS variables instead of font names**

In `globals.css`, replace:
```css
/* Remove the @import line entirely */
font-family: 'JetBrains Mono', monospace;  →  font-family: var(--font-mono), monospace;
font-family: 'Syne', sans-serif;           →  font-family: var(--font-syne), sans-serif;
```

Do a find-replace for all occurrences in all CSS files.

**Step 3: Verify fonts still load correctly**

```bash
npm run dev
```

Visit `http://localhost:3000` — fonts should look identical. Network tab should show fonts served from `/_next/static/` (not fonts.googleapis.com).

**Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css && git commit -m "migrate to next/font"
```

---

## Phase 4: Keystatic Configuration

### Task 10: Create Keystatic config

**Files:**
- Create: `keystatic.config.ts`

**Step 1: Create the config**

```ts
// keystatic.config.ts
import { config, collection, singleton, fields } from "@keystatic/core";

export default config({
  storage: { kind: "local" },

  singletons: {
    home: singleton({
      label: "Home Page",
      path: "content/home",
      schema: {
        badge: fields.text({ label: "Badge text", defaultValue: "Available for work" }),
        headline: fields.text({ label: "Headline" }),
        subheading: fields.text({ label: "Subheading", multiline: true }),
      },
    }),

    about: singleton({
      label: "About Page",
      path: "content/about",
      schema: {
        bio: fields.markdoc({ label: "Bio" }),
        skills: fields.array(
          fields.text({ label: "Skill" }),
          { label: "Skills", itemLabel: (props) => props.fields.value.value ?? "Skill" }
        ),
      },
    }),
  },

  collections: {
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "content/projects/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({ label: "Description", multiline: true }),
        tags: fields.array(
          fields.text({ label: "Tag" }),
          { label: "Tags", itemLabel: (props) => props.fields.value.value ?? "Tag" }
        ),
        date: fields.date({ label: "Date" }),
        featured: fields.checkbox({ label: "Featured on home page", defaultValue: false }),
        liveUrl: fields.url({ label: "Live URL (optional)" }),
        repoUrl: fields.url({ label: "Repo URL (optional)" }),
        coverImage: fields.image({
          label: "Cover image (optional)",
          directory: "public/images/projects",
          publicPath: "/images/projects",
        }),
        content: fields.markdoc({ label: "Content" }),
      },
    }),

    posts: collection({
      label: "Blog Posts",
      slugField: "title",
      path: "content/posts/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        excerpt: fields.text({ label: "Excerpt", multiline: true }),
        date: fields.date({ label: "Date" }),
        tags: fields.array(
          fields.text({ label: "Tag" }),
          { label: "Tags", itemLabel: (props) => props.fields.value.value ?? "Tag" }
        ),
        coverImage: fields.image({
          label: "Cover image (optional)",
          directory: "public/images/posts",
          publicPath: "/images/posts",
        }),
        content: fields.markdoc({ label: "Content" }),
      },
    }),
  },
});
```

**Step 2: Commit**

```bash
git add keystatic.config.ts && git commit -m "add keystatic config"
```

---

### Task 11: Add Keystatic admin route

**Files:**
- Create: `src/app/keystatic/[[...params]]/page.tsx`
- Create: `src/app/api/keystatic/[...params]/route.ts`

**Step 1: Create the admin page**

```tsx
// src/app/keystatic/[[...params]]/page.tsx
import { makeKeystaticRouteHandler } from "@keystatic/next/ui/app";
import config from "../../../../keystatic.config";

export const { GET, POST } = makeKeystaticRouteHandler({ config });

export default makeKeystaticRouteHandler({ config }).default;
```

NOTE: Keystatic's exact import paths changed in recent versions. Check `node_modules/@keystatic/next/README.md` if this import throws — the package exports the correct path.

**Step 2: Create the API route**

```ts
// src/app/api/keystatic/[...params]/route.ts
import { makeKeystaticRouteHandler } from "@keystatic/next/api";
import config from "../../../../keystatic.config";

export const { GET, POST } = makeKeystaticRouteHandler({ config });
```

**Step 3: Verify admin UI loads**

```bash
npm run dev
```

Visit `http://localhost:3000/keystatic` — Keystatic dashboard should appear.

**Step 4: Commit**

```bash
git add src/app/keystatic src/app/api/keystatic && git commit -m "add keystatic admin route"
```

---

### Task 12: Seed initial content

**Step 1: Open the Keystatic admin and create content**

Visit `http://localhost:3000/keystatic` and fill in:

- **Home singleton:** badge, headline, subheading (copy from `archive/portfolio.jsx.bak`)
- **About singleton:** bio paragraphs (as markdown), skills list
- **3 projects** from the existing `projects` array in the archive file

This creates `.yaml` and `.mdoc` files in `content/`.

**Step 2: Verify files exist**

```bash
ls content/home content/about content/projects
```

**Step 3: Commit**

```bash
git add content/ public/images/ && git commit -m "seed initial content"
```

---

## Phase 5: Home Page

### Task 13: Create Home page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/page.module.css`

**Step 1: Create Home page CSS**

```css
/* src/app/page.module.css */
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  padding: 120px 24px 80px;
  max-width: 900px;
  margin: 0 auto;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  padding: 6px 14px;
  border: 1px solid var(--accent-dim);
  border-radius: 100px;
  background: var(--accent-glow);
  margin-bottom: 32px;
  animation: fadeUp 0.8s ease both;
}

.badgeDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: pulse 2s ease infinite;
}

.heading {
  font-family: var(--font-syne), sans-serif;
  font-weight: 800;
  font-size: clamp(40px, 8vw, 72px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
  animation: fadeUp 0.8s ease 0.1s both;
}

.gradient {
  background: linear-gradient(135deg, var(--grad-from), var(--grad-to));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sub {
  font-size: 16px;
  color: var(--text-secondary);
  max-width: 520px;
  margin-bottom: 40px;
  animation: fadeUp 0.8s ease 0.2s both;
}

.cta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  animation: fadeUp 0.8s ease 0.3s both;
}

.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono), monospace;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 14px 28px;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, var(--grad-from), var(--grad-to));
  color: #06060e;
  border: none;
  min-height: 44px;
}

.btnPrimary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 30px rgba(0, 212, 255, 0.26);
}

.btnGhost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono), monospace;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 14px 28px;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  min-height: 44px;
}

.btnGhost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.glow {
  position: absolute;
  top: 20%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  filter: blur(60px);
  will-change: transform;
  animation: drift 8s ease-in-out infinite;
}
```

**Step 2: Create Home page**

```tsx
// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { createReader } from "@keystatic/core/reader";
import config from "../../keystatic.config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Kendall Adkins — Senior Front End Engineer",
  description:
    "Senior Front End Engineer crafting performant, accessible, and visually refined interfaces for the modern web.",
};

export default async function HomePage() {
  const reader = createReader(process.cwd(), config);
  const home = await reader.singletons.home.read();

  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.glow} aria-hidden="true" />
      <span className={styles.badge}>
        <span className={styles.badgeDot} aria-hidden="true" />
        {home?.badge ?? "Available for work"}
      </span>
      <h1 className={styles.heading}>
        Kendall<br />
        <span className={styles.gradient}>Adkins</span>
      </h1>
      <p className={styles.sub}>
        {home?.subheading ?? "Senior Front End Engineer crafting performant, accessible, and visually refined interfaces for the modern web."}
      </p>
      <div className={styles.cta}>
        <Link href="/projects" className={styles.btnPrimary}>View Projects</Link>
        <Link href="/about" className={styles.btnGhost}>About Me</Link>
      </div>
    </section>
  );
}
```

**Step 3: Verify home page renders**

```bash
npm run dev
```

Visit `http://localhost:3000` — hero section should display with content from Keystatic.

**Step 4: Commit**

```bash
git add src/app/page.tsx src/app/page.module.css && git commit -m "add home page"
```

---

## Phase 6: About Page

### Task 14: Create About page

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/about/page.module.css`

**Step 1: Create About CSS**

```css
/* src/app/about/page.module.css */
.content {
  display: grid;
  gap: 48px;
}

.bio {
  font-size: 15px;
  color: var(--text-secondary);
  max-width: 600px;
}

.bio p + p { margin-top: 16px; }

.skillsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 32px;
}

.skillItem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.skillItem:hover {
  border-color: var(--accent-dim);
  color: var(--text-primary);
  box-shadow: 0 0 20px var(--accent-glow);
}

.skillDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--grad-from), var(--grad-to));
  flex-shrink: 0;
}
```

**Step 2: Create About page**

```tsx
// src/app/about/page.tsx
import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import { DocumentRenderer } from "@keystatic/core/renderer";
import config from "../../../keystatic.config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "Senior Front End Engineer with a deep focus on design systems, performance optimization, and accessibility.",
};

export default async function AboutPage() {
  const reader = createReader(process.cwd(), config);
  const about = await reader.singletons.about.read();
  const bio = await about?.bio();

  return (
    <div className="section-wrapper">
      <div className={styles.content}>
        <div className="fade-in">
          <p className="section-label">About</p>
          <h1 className="section-title">Building the interface layer between people and technology.</h1>
          <div className={styles.bio}>
            {bio && <DocumentRenderer document={bio} />}
          </div>
        </div>

        <div className="fade-in">
          <p className="section-label">Expertise</p>
          <ul className={styles.skillsGrid} aria-label="Technical skills">
            {(about?.skills ?? []).map((skill) => (
              <li key={skill} className={styles.skillItem}>
                <span className={styles.skillDot} aria-hidden="true" />
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Add fade-in observer (client component)**

Create `src/components/FadeInObserver.tsx` — a client component that adds `.visible` to `.fade-in` elements:

```tsx
// src/components/FadeInObserver.tsx
"use client";
import { useEffect } from "react";

export default function FadeInObserver() {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return null;
}
```

Add `<FadeInObserver />` to `src/app/layout.tsx` inside `<body>`.

**Step 4: Commit**

```bash
git add src/app/about/ src/components/FadeInObserver.tsx src/app/layout.tsx && git commit -m "add about page"
```

---

## Phase 7: Projects Pages

### Task 15: Create ProjectCard component

**Files:**
- Create: `src/components/ProjectCard.tsx`
- Create: `src/components/ProjectCard.module.css`

**Step 1: Create ProjectCard CSS**

```css
/* src/components/ProjectCard.module.css */
.card {
  position: relative;
  padding: 32px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  transition: all 0.4s ease;
  overflow: hidden;
  text-decoration: none;
  display: block;
  color: inherit;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-dim), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.card:hover {
  border-color: var(--accent-dim);
  transform: translateY(-2px);
  box-shadow: 0 8px 40px rgba(6,6,14,0.5), 0 0 30px var(--accent-glow);
}

.card:hover::before { opacity: 1; }

.image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
}

.number {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.title {
  font-family: var(--font-syne), sans-serif;
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}

.desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.7;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  padding: 4px 12px;
  border-radius: 100px;
  background: var(--accent-glow);
  color: var(--accent);
  border: 1px solid rgba(0, 212, 255, 0.08);
}
```

**Step 2: Create ProjectCard component**

```tsx
// src/components/ProjectCard.tsx
import Link from "next/link";
import Image from "next/image";
import styles from "./ProjectCard.module.css";

type Props = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  coverImage?: string | null;
  index: number;
};

export default function ProjectCard({ slug, title, description, tags, coverImage, index }: Props) {
  return (
    <Link href={`/projects/${slug}`} className={styles.card}>
      {coverImage && (
        <Image
          src={coverImage}
          alt={`${title} preview`}
          width={800}
          height={400}
          className={styles.image}
        />
      )}
      <div className={styles.number}>0{index + 1}</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.desc}>{description}</p>
      <div className={styles.tags} aria-label="Technologies used">
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
    </Link>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/ProjectCard.tsx src/components/ProjectCard.module.css && git commit -m "add ProjectCard component"
```

---

### Task 16: Create Projects listing page

**Files:**
- Create: `src/app/projects/page.tsx`
- Create: `src/app/projects/page.module.css`

**Step 1: Create Projects listing CSS**

```css
/* src/app/projects/page.module.css */
.grid {
  display: grid;
  gap: 24px;
  margin-top: 8px;
}
```

**Step 2: Create Projects listing page**

```tsx
// src/app/projects/page.tsx
import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import ProjectCard from "@/components/ProjectCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected frontend engineering work — design systems, performance optimization, and more.",
};

export default async function ProjectsPage() {
  const reader = createReader(process.cwd(), config);
  const projects = await reader.collections.projects.all();

  const sorted = projects.sort(
    (a, b) => new Date(b.entry.date ?? 0).getTime() - new Date(a.entry.date ?? 0).getTime()
  );

  return (
    <div className="section-wrapper">
      <div className="fade-in">
        <p className="section-label">Projects</p>
        <h1 className="section-title">Selected work.</h1>
      </div>
      <div className={styles.grid}>
        {sorted.map((project, i) => (
          <div key={project.slug} className="fade-in">
            <ProjectCard
              slug={project.slug}
              title={project.entry.title}
              description={project.entry.description}
              tags={project.entry.tags}
              coverImage={project.entry.coverImage ?? null}
              index={i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/projects/ && git commit -m "add projects listing page"
```

---

### Task 17: Create Project detail page

**Files:**
- Create: `src/app/projects/[slug]/page.tsx`
- Create: `src/app/projects/[slug]/page.module.css`

**Step 1: Create detail CSS**

```css
/* src/app/projects/[slug]/page.module.css */
.header { margin-bottom: 40px; }

.coverImage {
  width: 100%;
  height: auto;
  border-radius: 12px;
  margin-bottom: 40px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.tag {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  padding: 4px 12px;
  border-radius: 100px;
  background: var(--accent-glow);
  color: var(--accent);
  border: 1px solid rgba(0, 212, 255, 0.08);
}

.links {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.content {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.8;
  max-width: 680px;
}

.content h2 {
  font-family: var(--font-syne), sans-serif;
  color: var(--text-primary);
  margin-top: 40px;
  margin-bottom: 16px;
}

.content p { margin-bottom: 16px; }

.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  background: linear-gradient(135deg, var(--grad-from), var(--grad-to));
  color: #06060e;
  min-height: 44px;
}

.btnGhost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  min-height: 44px;
}
```

**Step 2: Create detail page**

```tsx
// src/app/projects/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createReader } from "@keystatic/core/reader";
import { DocumentRenderer } from "@keystatic/core/renderer";
import config from "../../../../keystatic.config";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const reader = createReader(process.cwd(), config);
  const slugs = await reader.collections.projects.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const reader = createReader(process.cwd(), config);
  const project = await reader.collections.projects.read(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.coverImage ? [project.coverImage] : [],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const reader = createReader(process.cwd(), config);
  const project = await reader.collections.projects.read(slug);
  if (!project) notFound();

  const content = await project.content();

  return (
    <div className="section-wrapper">
      <div className={styles.header}>
        <p className="section-label">Project</p>
        <h1 className="section-title">{project.title}</h1>
        <div className={styles.tags}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>

      {project.coverImage && (
        <Image
          src={project.coverImage}
          alt={`${project.title} preview`}
          width={900}
          height={500}
          className={styles.coverImage}
          priority
        />
      )}

      <div className={styles.content}>
        <DocumentRenderer document={content} />
      </div>

      <div className={styles.links}>
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
            Live Site
          </a>
        )}
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>
            View Code
          </a>
        )}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/projects/[slug]/ && git commit -m "add project detail page"
```

---

## Phase 8: Blog Pages

### Task 18: Create PostCard component

**Files:**
- Create: `src/components/PostCard.tsx`
- Create: `src/components/PostCard.module.css`

**Step 1: Create read-time utility and test it**

```ts
// src/lib/readTime.ts
export function readTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
```

```ts
// src/lib/readTime.test.ts
import { describe, it, expect } from "vitest";
import { readTime } from "./readTime";

describe("readTime", () => {
  it("returns 1 min for short text", () => {
    expect(readTime("hello world")).toBe("1 min read");
  });

  it("returns correct minutes for longer text", () => {
    const words = Array(400).fill("word").join(" ");
    expect(readTime(words)).toBe("2 min read");
  });
});
```

**Step 2: Run test to verify it passes**

```bash
npm test
```

Expected: 2 tests pass.

**Step 3: Create PostCard CSS**

```css
/* src/components/PostCard.module.css */
.card {
  display: block;
  padding: 28px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--accent-dim);
  transform: translateY(-2px);
  box-shadow: 0 8px 40px rgba(6,6,14,0.5);
}

.image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
}

.meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
}

.title {
  font-family: var(--font-syne), sans-serif;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.excerpt {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
}
```

**Step 4: Create PostCard component**

```tsx
// src/components/PostCard.tsx
import Link from "next/link";
import Image from "next/image";
import { readTime } from "@/lib/readTime";
import styles from "./PostCard.module.css";

type Props = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage?: string | null;
  contentPreview?: string;
};

export default function PostCard({ slug, title, excerpt, date, coverImage, contentPreview }: Props) {
  const formatted = new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <Link href={`/blog/${slug}`} className={styles.card}>
      {coverImage && (
        <Image src={coverImage} alt="" width={800} height={360} className={styles.image} />
      )}
      <div className={styles.meta}>
        <time dateTime={date}>{formatted}</time>
        {contentPreview && <span>{readTime(contentPreview)}</span>}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.excerpt}>{excerpt}</p>
    </Link>
  );
}
```

**Step 5: Commit**

```bash
git add src/components/PostCard.tsx src/components/PostCard.module.css src/lib/ && git commit -m "add PostCard and readTime utility"
```

---

### Task 19: Create Blog listing page

**Files:**
- Create: `src/app/blog/page.tsx`
- Create: `src/app/blog/page.module.css`

**Step 1: Create Blog listing CSS**

```css
/* src/app/blog/page.module.css */
.grid {
  display: grid;
  gap: 24px;
  margin-top: 8px;
}
```

**Step 2: Create Blog listing page**

```tsx
// src/app/blog/page.tsx
import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import PostCard from "@/components/PostCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on frontend engineering, design systems, performance, and accessibility.",
};

export default async function BlogPage() {
  const reader = createReader(process.cwd(), config);
  const posts = await reader.collections.posts.all();

  const sorted = posts.sort(
    (a, b) => new Date(b.entry.date ?? 0).getTime() - new Date(a.entry.date ?? 0).getTime()
  );

  return (
    <div className="section-wrapper">
      <div className="fade-in">
        <p className="section-label">Blog</p>
        <h1 className="section-title">Writing.</h1>
      </div>
      <div className={styles.grid}>
        {sorted.map((post) => (
          <div key={post.slug} className="fade-in">
            <PostCard
              slug={post.slug}
              title={post.entry.title}
              excerpt={post.entry.excerpt}
              date={post.entry.date ?? ""}
              coverImage={post.entry.coverImage ?? null}
            />
          </div>
        ))}
        {sorted.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>No posts yet. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/blog/ && git commit -m "add blog listing page"
```

---

### Task 20: Create Blog post detail page

**Files:**
- Create: `src/app/blog/[slug]/page.tsx`
- Create: `src/app/blog/[slug]/page.module.css`

**Step 1: Create post detail CSS**

```css
/* src/app/blog/[slug]/page.module.css */
.header { margin-bottom: 40px; }

.meta {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
}

.coverImage {
  width: 100%;
  height: auto;
  border-radius: 12px;
  margin-bottom: 48px;
}

.content {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.9;
  max-width: 680px;
}

.content h2 {
  font-family: var(--font-syne), sans-serif;
  color: var(--text-primary);
  font-size: clamp(22px, 4vw, 30px);
  margin-top: 48px;
  margin-bottom: 16px;
}

.content h3 {
  font-family: var(--font-syne), sans-serif;
  color: var(--text-primary);
  font-size: clamp(18px, 3vw, 24px);
  margin-top: 32px;
  margin-bottom: 12px;
}

.content p { margin-bottom: 20px; }

.content code {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 14px;
}

.content pre {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  overflow-x: auto;
  margin: 24px 0;
}

.content a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
```

**Step 2: Create post detail page**

```tsx
// src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createReader } from "@keystatic/core/reader";
import { DocumentRenderer } from "@keystatic/core/renderer";
import { readTime } from "@/lib/readTime";
import config from "../../../../keystatic.config";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const reader = createReader(process.cwd(), config);
  const slugs = await reader.collections.posts.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const reader = createReader(process.cwd(), config);
  const post = await reader.collections.posts.read(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date ?? undefined,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const reader = createReader(process.cwd(), config);
  const post = await reader.collections.posts.read(slug);
  if (!post) notFound();

  const content = await post.content();
  const formatted = new Date(post.date ?? "").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="section-wrapper">
      <div className={styles.header}>
        <p className="section-label">Blog</p>
        <h1 className="section-title">{post.title}</h1>
        <div className={styles.meta}>
          <time dateTime={post.date ?? ""}>{formatted}</time>
        </div>
      </div>

      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt=""
          width={900}
          height={500}
          className={styles.coverImage}
          priority
        />
      )}

      <article className={styles.content}>
        <DocumentRenderer document={content} />
      </article>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/blog/[slug]/ && git commit -m "add blog post detail page"
```

---

## Phase 9: Contact Page

### Task 21: Write contact API route test and implementation

**Files:**
- Create: `src/app/api/contact/route.ts`
- Create: `src/app/api/contact/route.test.ts`

**Step 1: Set up environment variable**

Create `.env.local`:
```
RESEND_API_KEY=re_your_key_here
CONTACT_EMAIL=hello@kendalladkins.com
```

Get your free API key at resend.com.

**Step 2: Write the failing test**

```ts
// src/app/api/contact/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Resend before importing route
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null }),
    },
  })),
}));

// We test the handler logic directly
async function callHandler(body: object) {
  const { POST } = await import("./route");
  const req = new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(req);
}

describe("POST /api/contact", () => {
  beforeEach(() => vi.resetModules());

  it("returns 400 when fields are missing", async () => {
    const res = await callHandler({ name: "", email: "", message: "" });
    expect(res.status).toBe(400);
  });

  it("returns 200 with valid fields", async () => {
    const res = await callHandler({
      name: "Test User",
      email: "test@example.com",
      message: "Hello!",
    });
    expect(res.status).toBe(200);
  });

  it("ignores requests with honeypot filled", async () => {
    const res = await callHandler({
      name: "Bot",
      email: "bot@example.com",
      message: "Spam",
      website: "filled",
    });
    expect(res.status).toBe(200); // silently succeed to not tip off bots
  });
});
```

**Step 3: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `route.ts` doesn't exist yet.

**Step 4: Implement the API route**

```ts
// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, message, website } = body;

  // Honeypot — bots fill hidden fields
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: process.env.CONTACT_EMAIL ?? "",
    subject: `New message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

**Step 5: Run test to verify it passes**

```bash
npm test
```

Expected: 3 tests pass.

**Step 6: Commit**

```bash
git add src/app/api/contact/ .env.local && git commit -m "add contact API route"
```

NOTE: Add `.env.local` to `.gitignore` if not already there.

---

### Task 22: Create Contact page

**Files:**
- Create: `src/app/contact/page.tsx`
- Create: `src/app/contact/page.module.css`

**Step 1: Create Contact CSS**

```css
/* src/app/contact/page.module.css */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 560px;
  margin-top: 40px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
}

.input,
.textarea {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
  font-family: var(--font-mono), monospace;
  font-size: 14px;
  color: var(--text-primary);
  transition: border-color 0.3s ease;
  width: 100%;
  min-height: 44px;
}

.input:focus,
.textarea:focus {
  border-color: var(--accent);
  outline: none;
}

.textarea {
  min-height: 140px;
  resize: vertical;
}

.honeypot {
  display: none;
}

.submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-mono), monospace;
  font-size: 14px;
  font-weight: 500;
  padding: 14px 28px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, var(--grad-from), var(--grad-to));
  color: #06060e;
  border: none;
  min-height: 44px;
  align-self: flex-start;
}

.submit:hover { transform: translateY(-1px); }
.submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.success {
  color: var(--accent);
  font-size: 15px;
  margin-top: 8px;
}

.error {
  color: #ff6b6b;
  font-size: 14px;
}
```

**Step 2: Create Contact page (client component for form state)**

```tsx
// src/app/contact/page.tsx
"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function ContactPage() {
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

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setStatus(res.ok ? "success" : "error");
    if (res.ok) form.reset();
  }

  return (
    <div className="section-wrapper">
      <p className="section-label">Contact</p>
      <h1 className="section-title">Get in touch.</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
        Have a project in mind or just want to say hello? I'd love to hear from you.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Honeypot */}
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
          <input id="name" name="name" type="text" required className={styles.input} autoComplete="name" />
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input id="email" name="email" type="email" required className={styles.input} autoComplete="email" />
        </div>

        <div className={styles.field}>
          <label htmlFor="message" className={styles.label}>Message</label>
          <textarea id="message" name="message" required className={styles.textarea} rows={5} />
        </div>

        <button type="submit" disabled={status === "loading"} className={styles.submit}>
          {status === "loading" ? "Sending…" : "Send Message"}
        </button>

        {status === "success" && (
          <p className={styles.success} role="status">Message sent! I'll get back to you soon.</p>
        )}
        {status === "error" && (
          <p className={styles.error} role="alert">Something went wrong. Please try again or email me directly.</p>
        )}
      </form>
    </div>
  );
}
```

NOTE: Add `export const metadata` to a separate `layout.tsx` inside `app/contact/` since this is a client component:

```tsx
// src/app/contact/layout.tsx
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Kendall Adkins.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
```

**Step 3: Commit**

```bash
git add src/app/contact/ && git commit -m "add contact page and form"
```

---

## Phase 10: SEO

### Task 23: Add JSON-LD structured data

**Files:**
- Create: `src/components/JsonLd.tsx`
- Modify: `src/app/layout.tsx` (add Person schema)
- Modify: `src/app/blog/[slug]/page.tsx` (add Article schema)
- Modify: `src/app/projects/[slug]/page.tsx` (add CreativeWork schema)

**Step 1: Create JsonLd component**

```tsx
// src/components/JsonLd.tsx
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

**Step 2: Add Person schema to root layout**

In `src/app/layout.tsx`, import JsonLd and add inside `<head>` (or directly in body before main):

```tsx
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kendall Adkins",
  url: "https://kendalladkins.com",
  jobTitle: "Senior Front End Engineer",
  sameAs: [
    "https://github.com/kendalladkins",
    "https://linkedin.com/in/kendalladkins",
  ],
};
```

Add `<JsonLd data={personSchema} />` inside `<body>`.

**Step 3: Add Article schema to blog post page**

In `src/app/blog/[slug]/page.tsx`, add inside the returned JSX:

```tsx
<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.excerpt,
  datePublished: post.date,
  author: { "@type": "Person", name: "Kendall Adkins" },
  image: post.coverImage ?? undefined,
}} />
```

**Step 4: Add CreativeWork schema to project detail page**

In `src/app/projects/[slug]/page.tsx`:

```tsx
<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: project.title,
  description: project.description,
  author: { "@type": "Person", name: "Kendall Adkins" },
  image: project.coverImage ?? undefined,
  url: project.liveUrl ?? undefined,
}} />
```

**Step 5: Commit**

```bash
git add src/components/JsonLd.tsx src/app/layout.tsx src/app/blog src/app/projects && git commit -m "add JSON-LD structured data"
```

---

### Task 24: Add sitemap and robots.txt

**Files:**
- Create: `next-sitemap.config.js`

**Step 1: Create sitemap config**

```js
// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://kendalladkins.com",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
  exclude: ["/keystatic", "/keystatic/*", "/api/*"],
};
```

**Step 2: Add postbuild script to package.json**

```json
"scripts": {
  "postbuild": "next-sitemap"
}
```

**Step 3: Verify sitemap generates**

```bash
npm run build
```

Expected: `public/sitemap.xml` and `public/robots.txt` created.

**Step 4: Commit**

```bash
git add next-sitemap.config.js package.json public/sitemap.xml public/robots.txt && git commit -m "add sitemap and robots.txt"
```

---

### Task 25: Add RSS feed

**Files:**
- Create: `src/app/feed.xml/route.ts`

**Step 1: Create RSS route**

```ts
// src/app/feed.xml/route.ts
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";

export async function GET() {
  const reader = createReader(process.cwd(), config);
  const posts = await reader.collections.posts.all();

  const sorted = posts
    .filter((p) => p.entry.date)
    .sort((a, b) => new Date(b.entry.date!).getTime() - new Date(a.entry.date!).getTime());

  const baseUrl = "https://kendalladkins.com";

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kendall Adkins — Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Thoughts on frontend engineering, design systems, and the web.</description>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${sorted.map((post) => `
    <item>
      <title>${escapeXml(post.entry.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.entry.excerpt)}</description>
      <pubDate>${new Date(post.entry.date!).toUTCString()}</pubDate>
    </item>`).join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { "Content-Type": "application/xml" },
  });
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

**Step 2: Add RSS link to layout `<head>`**

In `src/app/layout.tsx` metadata:
```ts
alternates: {
  types: {
    "application/rss+xml": "https://kendalladkins.com/feed.xml",
  },
},
```

**Step 3: Commit**

```bash
git add src/app/feed.xml/ src/app/layout.tsx && git commit -m "add RSS feed"
```

---

## Phase 11: Deploy to Vercel

### Task 26: Deploy to Vercel

**Step 1: Push to GitHub**

Create a new repository at github.com, then:

```bash
git remote add origin https://github.com/kendalladkins/portfolio.git
git push -u origin main
```

**Step 2: Import to Vercel**

1. Go to vercel.com → New Project
2. Import the GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `npm run build` (default)
5. Output directory: `.next` (default)

**Step 3: Add environment variables in Vercel dashboard**

Settings → Environment Variables:
```
RESEND_API_KEY = re_your_key_here
CONTACT_EMAIL  = hello@kendalladkins.com
```

**Step 4: Deploy**

Click Deploy. Vercel builds and deploys automatically.

**Step 5: Set custom domain (optional)**

Settings → Domains → Add `kendalladkins.com`. Follow the DNS instructions.

**Step 6: Verify**

- Visit your deployed URL
- Check `/keystatic` loads (dev mode — in production, Keystatic admin is only accessible locally or via a separate auth setup)
- Submit the contact form and verify email arrives
- Run `https://pagespeed.web.dev` against your URL — target LCP < 2.5s

---

## Phase 12: Polish & Verification

### Task 27: Verify accessibility

**Step 1: Install axe browser extension**

Install [axe DevTools](https://www.deque.com/axe/browser-extensions/) in Chrome/Firefox.

**Step 2: Check each page**

Visit each page and run axe:
- `/` — home
- `/about`
- `/projects`
- `/blog`
- `/contact`

Expected: 0 critical violations.

**Step 3: Keyboard navigation check**

Tab through every page. Verify:
- Skip link appears on first Tab press
- All nav items focusable and labeled
- Mobile menu toggle accessible
- Contact form fields all labeled
- Project/post cards navigate to correct URLs

**Step 4: Commit any fixes found**

```bash
git add -A && git commit -m "a11y fixes from audit"
```

---

### Task 28: Verify Core Web Vitals

**Step 1: Run Lighthouse on production URL**

```bash
npx unlighthouse --site https://your-vercel-url.vercel.app
```

Or use Chrome DevTools → Lighthouse tab on the deployed URL.

**Step 2: Target scores**

| Metric | Target |
|---|---|
| Performance | ≥ 90 |
| Accessibility | 100 |
| Best Practices | ≥ 90 |
| SEO | 100 |

**Step 3: Fix any issues and redeploy**

Push fixes to `main` → Vercel auto-deploys.

---

## Checklist

- [x] Task 1: Scaffold Next.js
- [x] Task 2: Install dependencies
- [x] Task 3: Configure next.config.ts
- [x] Task 4: Configure Vitest
- [x] Task 5: Global CSS and theme
- [x] Task 6: Nav component
- [x] Task 7: Footer component
- [x] Task 8: Root layout
- [x] Task 9: Migrate to next/font
- [x] Task 10: Keystatic config
- [x] Task 11: Keystatic admin route
- [x] Task 12: Seed initial content
- [x] Task 13: Home page
- [x] Task 14: About page
- [x] Task 15: ProjectCard component
- [x] Task 16: Projects listing page
- [x] Task 17: Project detail page
- [x] Task 18: PostCard + readTime utility
- [x] Task 19: Blog listing page
- [x] Task 20: Blog post detail page
- [x] Task 21: Contact API route (TDD)
- [x] Task 22: Contact page
- [x] Task 23: JSON-LD structured data
- [x] Task 24: Sitemap + robots.txt
- [x] Task 25: RSS feed
- [ ] Task 26: Deploy to Vercel
- [ ] Task 27: Accessibility audit
- [ ] Task 28: Core Web Vitals verification
