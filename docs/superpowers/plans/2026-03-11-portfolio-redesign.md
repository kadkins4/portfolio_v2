# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the portfolio site with a warm, minimal aesthetic, simplified structure (Home, About, Work), and mobile-first responsive layouts.

**Architecture:** Replace current cyan/purple dark theme with warm gold accent palette. Merge separate projects and posts collections into unified "work" collection. Simplify navigation to two text links (About, Work). Footer shows social SVG icons instead of text links.

**Tech Stack:** Next.js 16.x, React 19.x, TypeScript, Keystatic CMS, CSS custom properties (no framework)

**Spec:** `docs/superpowers/specs/2026-03-11-portfolio-redesign-design.md`

---

## File Structure

### Files to Create

| Path                                              | Purpose                                                  |
| ------------------------------------------------- | -------------------------------------------------------- |
| `src/app/globals-new.css`                         | New design system (replace globals.css after validation) |
| `src/components/Header.tsx`                       | New header with KA logo and text nav                     |
| `src/components/Header.module.css`                | Header styles                                            |
| `src/components/Tag.tsx`                          | Reusable tag component                                   |
| `src/components/Tag.module.css`                   | Tag styles                                               |
| `src/components/WorkCard.tsx`                     | Unified card for work items                              |
| `src/components/WorkCard.module.css`              | WorkCard styles                                          |
| `src/app/(portfolio)/work/page.tsx`               | Work listing page                                        |
| `src/app/(portfolio)/work/page.module.css`        | Work page styles                                         |
| `src/app/(portfolio)/work/[slug]/page.tsx`        | Work detail page                                         |
| `src/app/(portfolio)/work/[slug]/page.module.css` | Work detail styles                                       |
| `content/work/*.mdoc`                             | Migrated work content files                              |

### Files to Modify

| Path                                        | Changes                                               |
| ------------------------------------------- | ----------------------------------------------------- |
| `keystatic.config.ts`                       | Add work collection, update about schema with hobbies |
| `src/app/globals.css`                       | Replace with new design system                        |
| `src/app/(portfolio)/page.tsx`              | Simplify to hero-only layout                          |
| `src/app/(portfolio)/page.module.css`       | New hero styles                                       |
| `src/app/(portfolio)/about/page.tsx`        | Add hobbies section, use new tags                     |
| `src/app/(portfolio)/about/page.module.css` | Updated about styles                                  |
| `src/app/(portfolio)/layout.tsx`            | Use new Header, simplified footer                     |
| `src/components/Footer.tsx`                 | SVG icons only, simplified                            |
| `src/components/SocialLinks.tsx`            | Remove text labels, icon-only                         |
| `content/about.yaml`                        | Add hobbies array                                     |
| `content/site-settings.yaml`                | Update social links, remove enabledRoutes             |

### Files to Delete (after migration)

| Path                             | Reason                            |
| -------------------------------- | --------------------------------- |
| `src/app/(portfolio)/blog/*`     | Merged into /work                 |
| `src/app/(portfolio)/projects/*` | Merged into /work                 |
| `src/app/(portfolio)/contact/*`  | Removed (social links in footer)  |
| `src/app/api/contact/*`          | Contact form API no longer needed |
| `src/components/Nav.tsx`         | Replaced by Header.tsx            |
| `src/components/Nav.module.css`  | Replaced by Header.module.css     |
| `src/components/PostCard.tsx`    | Replaced by WorkCard              |
| `src/components/ProjectCard.tsx` | Replaced by WorkCard              |
| `content/posts/*.mdoc`           | Migrated to content/work/         |
| `content/projects/*.mdoc`        | Migrated to content/work/         |

---

## Chunk 1: Setup and Design System

### Task 1.1: Create Feature Branch

**Files:**

- None (git operation)

- [ ] **Step 1: Create and checkout feature branch**

```bash
git checkout -b feature/portfolio-redesign
```

- [ ] **Step 2: Verify branch**

Run: `git branch --show-current`
Expected: `feature/portfolio-redesign`

---

### Task 1.2: Implement New Design System

**Files:**

- Create: `src/app/globals-new.css`

- [ ] **Step 1: Create new globals file with design tokens**

```css
/* Design tokens */
:root {
  /* Backgrounds */
  --bg-primary: #0d0b09;
  --bg-secondary: #12100e;

  /* Accent */
  --accent: #a08060;

  /* Text */
  --text-primary: #ebe6e0;
  --text-secondary: #8a847c;
  --text-muted: #6a645c;

  /* Border */
  --border: #1a1816;

  /* Tag colors */
  --tag-project-bg: #a08060;
  --tag-project-text: #0d0b09;
  --tag-writing-bg: #6a645c;
  --tag-writing-text: #ebe6e0;
  --tag-hobby-bg: #705a40;
  --tag-hobby-text: #ebe6e0;
}

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background: linear-gradient(180deg, #0d0b09 0%, #0f0d0a 50%, #12100d 100%);
  background-attachment: fixed;
  color: var(--text-primary);
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

::selection {
  background: var(--accent);
  color: var(--bg-primary);
}

*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  padding: 8px 16px;
  background: var(--accent);
  color: var(--bg-primary);
  border-radius: 4px;
  font-size: 14px;
  z-index: 200;
  text-decoration: none;
}

.skip-link:focus {
  top: 8px;
}

/* Typography */
.font-serif {
  font-family: "Playfair Display", "Source Serif Pro", Georgia, serif;
}

/* Container */
.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Links */
a {
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--accent);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 2: Verify file exists**

Run: `ls -la src/app/globals-new.css`
Expected: File listed with size > 0

- [ ] **Step 3: Commit design tokens**

```bash
git add src/app/globals-new.css
git commit -m "add new design system with warm color palette"
```

---

### Task 1.3: Add Google Fonts

**Files:**

- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Read current layout**

Read `src/app/layout.tsx` to understand current font setup.

- [ ] **Step 2: Update font imports**

Add Playfair Display and Inter fonts. Replace existing font configuration:

```tsx
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
```

Update the body className to include both font variables:

```tsx
<body className={`${playfair.variable} ${inter.variable}`}>
```

- [ ] **Step 3: Verify fonts load**

Run: `pnpm dev`
Expected: Dev server starts without errors

- [ ] **Step 4: Commit font changes**

```bash
git add src/app/layout.tsx
git commit -m "add Playfair Display and Inter fonts"
```

---

## Chunk 2: Core Components

### Task 2.1: Create Header Component

**Files:**

- Create: `src/components/Header.tsx`
- Create: `src/components/Header.module.css`

- [ ] **Step 1: Create Header.module.css**

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  transition: background 0.2s ease;
}

.header.scrolled {
  background: rgba(13, 11, 9, 0.95);
  border-bottom: 1px solid var(--border);
}

.logo {
  font-family: var(--font-serif), Georgia, serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
}

.logo:hover {
  color: var(--accent);
}

.nav {
  display: flex;
  gap: 32px;
}

.navLink {
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.navLink:hover,
.navLink.active {
  color: var(--accent);
}

@media (max-width: 480px) {
  .nav {
    gap: 24px;
  }
}
```

- [ ] **Step 2: Create Header.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <Link href="/" className={styles.logo}>
        KA
      </Link>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link
          href="/about"
          className={`${styles.navLink} ${pathname === "/about" ? styles.active : ""}`}
        >
          About
        </Link>
        <Link
          href="/work"
          className={`${styles.navLink} ${pathname.startsWith("/work") ? styles.active : ""}`}
        >
          Work
        </Link>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Verify component compiles**

Run: `pnpm build 2>&1 | head -20`
Expected: No TypeScript errors for Header component

- [ ] **Step 4: Commit Header component**

```bash
git add src/components/Header.tsx src/components/Header.module.css
git commit -m "add Header component with KA logo"
```

---

### Task 2.2: Create Tag Component

**Files:**

- Create: `src/components/Tag.tsx`
- Create: `src/components/Tag.module.css`

- [ ] **Step 1: Create Tag.module.css**

```css
.tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project {
  background: var(--tag-project-bg);
  color: var(--tag-project-text);
}

.writing {
  background: var(--tag-writing-bg);
  color: var(--tag-writing-text);
}

.hobby {
  background: var(--tag-hobby-bg);
  color: var(--tag-hobby-text);
}

.skill {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
```

- [ ] **Step 2: Create Tag.tsx**

```tsx
import styles from "./Tag.module.css";

export type TagVariant = "project" | "writing" | "hobby" | "skill";

type Props = {
  variant: TagVariant;
  children: React.ReactNode;
};

export default function Tag({ variant, children }: Props) {
  return <span className={`${styles.tag} ${styles[variant]}`}>{children}</span>;
}
```

- [ ] **Step 3: Commit Tag component**

```bash
git add src/components/Tag.tsx src/components/Tag.module.css
git commit -m "add Tag component with variant styles"
```

---

### Task 2.3: Update Footer Component

**Files:**

- Modify: `src/components/Footer.tsx`
- Modify: `src/components/SocialLinks.tsx`
- Modify: `src/app/globals-new.css`

- [ ] **Step 1: Add footer styles to globals-new.css**

Append to `src/app/globals-new.css`:

```css
/* Footer */
.footer {
  padding: 48px 24px;
  text-align: center;
  border-top: 1px solid var(--border);
  margin-top: 80px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.footer-links a {
  color: var(--text-secondary);
  transition: color 0.2s ease;
  padding: 8px;
}

.footer-links a:hover {
  color: var(--accent);
}
```

- [ ] **Step 2: Verify SocialLinks accepts className prop**

Read `src/components/SocialLinks.tsx` and verify it already:

- Renders icons only (no text labels) - confirmed in existing code
- Accepts and applies `className` prop to the nav element - confirmed in existing code

No code changes needed for SocialLinks.tsx - it already supports the required behavior.

- [ ] **Step 3: Simplify Footer.tsx**

Update `src/components/Footer.tsx`:

```tsx
import { createReader } from "@keystatic/core/reader";
import config from "../../keystatic.config";
import SocialLinks from "./SocialLinks";

export default async function Footer() {
  const reader = createReader(process.cwd(), config);
  const settings = await reader.singletons.siteSettings.read();
  const links = (settings?.socialLinks ?? []).filter((l) => l.showInFooter);

  return (
    <footer className="footer">
      <SocialLinks links={links} className="footer-links" />
    </footer>
  );
}
```

- [ ] **Step 4: Commit footer updates**

```bash
git add src/components/Footer.tsx src/components/SocialLinks.tsx src/app/globals-new.css
git commit -m "simplify footer to icon-only social links"
```

---

### Task 2.4: Create WorkCard Component

**Files:**

- Create: `src/components/WorkCard.tsx`
- Create: `src/components/WorkCard.module.css`

- [ ] **Step 1: Create WorkCard.module.css**

```css
.card {
  display: block;
  text-decoration: none;
  color: inherit;
}

.imageWrapper {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.noImage {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 14px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.3;
}

.description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
}

.externalLink {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--accent);
}

.externalLink:hover {
  text-decoration: underline;
}

.card:hover .title {
  color: var(--accent);
}

/* Mobile: image-first stacked */
@media (max-width: 767px) {
  .card {
    margin-bottom: 32px;
  }
}
```

- [ ] **Step 2: Create WorkCard.tsx**

```tsx
import Link from "next/link";
import Image from "next/image";
import Tag from "./Tag";
import type { TagVariant } from "./Tag";
import styles from "./WorkCard.module.css";

type Props = {
  slug: string;
  title: string;
  description: string;
  type: "project" | "writing" | "hobby";
  image?: string | null;
  externalUrl?: string | null;
};

export default function WorkCard({
  slug,
  title,
  description,
  type,
  image,
  externalUrl,
}: Props) {
  const tagVariant: TagVariant = type;

  return (
    <article className={styles.card}>
      <Link href={`/work/${slug}`}>
        <div className={styles.imageWrapper}>
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className={styles.noImage}>No image</div>
          )}
          <div className={styles.tag}>
            <Tag variant={tagVariant}>{type}</Tag>
          </div>
        </div>
        <h3 className={styles.title}>{title}</h3>
      </Link>
      <p className={styles.description}>{description}</p>
      {externalUrl && (
        <a
          href={externalUrl}
          className={styles.externalLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Live &rarr;
        </a>
      )}
    </article>
  );
}
```

- [ ] **Step 3: Commit WorkCard component**

```bash
git add src/components/WorkCard.tsx src/components/WorkCard.module.css
git commit -m "add WorkCard component for unified work display"
```

---

## Chunk 3: Keystatic Schema and Content Migration

### Task 3.1: Update Keystatic Schema

**Files:**

- Modify: `keystatic.config.ts`

- [ ] **Step 1: Add work collection and update about schema**

Update `keystatic.config.ts`:

```typescript
import { config, collection, singleton, fields } from "@keystatic/core";

export default config({
  storage: { kind: "local" },

  singletons: {
    home: singleton({
      label: "Home Page",
      path: "content/home",
      schema: {
        title: fields.text({ label: "Title" }),
        tagline: fields.text({ label: "Tagline" }),
      },
    }),

    about: singleton({
      label: "About Page",
      path: "content/about",
      schema: {
        bio: fields.markdoc({ label: "Bio" }),
        skills: fields.array(fields.text({ label: "Skill" }), {
          label: "Skills",
          itemLabel: (props) => props.value ?? "Skill",
        }),
        hobbies: fields.array(fields.text({ label: "Hobby" }), {
          label: "Hobbies",
          itemLabel: (props) => props.value ?? "Hobby",
        }),
      },
    }),

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
                { label: "LinkedIn", value: "linkedin" },
              ],
              defaultValue: "github",
            }),
            url: fields.text({ label: "URL" }),
            showInFooter: fields.checkbox({
              label: "Show in footer",
              defaultValue: true,
            }),
          }),
          {
            label: "Social Links",
            itemLabel: (props) => props.fields.platform.value ?? "Link",
          }
        ),
      },
    }),
  },

  collections: {
    work: collection({
      label: "Work",
      slugField: "title",
      path: "content/work/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({
          label: "Description",
          multiline: true,
        }),
        type: fields.select({
          label: "Type",
          options: [
            { label: "Project", value: "project" },
            { label: "Writing", value: "writing" },
            { label: "Hobby", value: "hobby" },
          ],
          defaultValue: "project",
        }),
        image: fields.image({
          label: "Image (optional, recommended: 1200x675px, 16:9)",
          directory: "public/images/work",
          publicPath: "/images/work",
        }),
        externalUrl: fields.url({ label: "External URL (optional)" }),
        date: fields.date({ label: "Date" }),
        content: fields.markdoc({ label: "Content" }),
      },
    }),
  },
});
```

- [ ] **Step 2: Verify schema compiles**

Run: `pnpm build 2>&1 | head -20`
Expected: No TypeScript errors

- [ ] **Step 3: Commit schema update**

```bash
git add keystatic.config.ts
git commit -m "update keystatic schema with work collection"
```

---

### Task 3.2: Migrate Content Files

**Files:**

- Create: `content/work/` directory
- Modify: `content/home.yaml`
- Modify: `content/about.yaml`
- Modify: `content/site-settings.yaml`

- [ ] **Step 1: Create work directory**

```bash
mkdir -p content/work
mkdir -p public/images/work
```

- [ ] **Step 2: Update home.yaml**

```yaml
title: Kendall Adkins
tagline: Senior Software Engineer
```

- [ ] **Step 3: Update about.yaml with hobbies**

```yaml
skills:
  - React
  - NextJS
  - TypeScript
  - Node.js
  - HTML/CSS
  - PostgreSQL
  - GraphQL
  - REST APIs
  - Git
  - Docker
  - AWS
  - CI/CD
  - Testing (Jest/Vitest)
  - Claude Code
  - Mentoring
  - Project Planning
  - Technical Writing
  - Code Review
hobbies:
  - Photography
  - Hiking
  - Reading
  - Gaming
```

- [ ] **Step 4: Update site-settings.yaml**

```yaml
socialLinks:
  - platform: github
    url: https://github.com/kadkins4
    showInFooter: true
  - platform: linkedin
    url: https://www.linkedin.com/in/adkinskendall/
    showInFooter: true
  - platform: instagram
    url: https://www.instagram.com/kadkins4/
    showInFooter: true
```

- [ ] **Step 5: Migrate existing projects to work collection**

**Field mapping for projects:**
| Old Field (projects) | New Field (work) | Action |
|---------------------|------------------|--------|
| title | title | Keep as-is |
| description | description | Keep as-is |
| (new) | type | Add `type: project` |
| coverImage | image | Rename, update path from `/images/projects/` to `/images/work/` |
| liveUrl | externalUrl | Rename |
| repoUrl | (dropped) | Remove - or use as externalUrl if liveUrl is empty |
| date | date | Keep as-is |
| tags | (dropped) | Remove |
| featured | (dropped) | Remove |
| content | content | Keep as-is |

For each file in `content/projects/`:

1. Copy the `.mdoc` file to `content/work/`
2. Update frontmatter according to mapping above
3. Move any images from `public/images/projects/` to `public/images/work/`

**Field mapping for posts:**
| Old Field (posts) | New Field (work) | Action |
|------------------|------------------|--------|
| title | title | Keep as-is |
| excerpt | description | Rename |
| (new) | type | Add `type: writing` |
| coverImage | image | Rename, update path from `/images/posts/` to `/images/work/` |
| (new) | externalUrl | Leave empty |
| date | date | Keep as-is |
| tags | (dropped) | Remove |
| content | content | Keep as-is |

For each file in `content/posts/`:

1. Copy the `.mdoc` file to `content/work/`
2. Update frontmatter according to mapping above
3. Move any images from `public/images/posts/` to `public/images/work/`

- [ ] **Step 6: Verify migration is valid**

Run: `pnpm build 2>&1 | head -50`
Expected: No content validation errors from Keystatic

- [ ] **Step 7: Commit content migration**

```bash
git add content/
git commit -m "migrate content to new schema structure"
```

---

## Chunk 4: Page Implementations

### Task 4.1: Update Portfolio Layout

**Files:**

- Modify: `src/app/(portfolio)/layout.tsx`

- [ ] **Step 1: Update layout to use Header**

```tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main" style={{ paddingTop: "80px" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Commit layout update**

```bash
git add src/app/(portfolio)/layout.tsx
git commit -m "update layout to use new Header component"
```

---

### Task 4.2: Implement Home Page

**Files:**

- Modify: `src/app/(portfolio)/page.tsx`
- Modify: `src/app/(portfolio)/page.module.css`

- [ ] **Step 1: Create new page.module.css**

```css
.hero {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
}

.logo {
  font-family: var(--font-serif), Georgia, serif;
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.title {
  font-family: var(--font-serif), Georgia, serif;
  font-size: clamp(32px, 6vw, 48px);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.tagline {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.nav {
  display: flex;
  gap: 32px;
}

.navLink {
  font-size: 16px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.navLink:hover {
  color: var(--accent);
}
```

- [ ] **Step 2: Update page.tsx**

```tsx
import Link from "next/link";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import styles from "./page.module.css";

export default async function HomePage() {
  const reader = createReader(process.cwd(), config);
  const home = await reader.singletons.home.read();

  return (
    <section className={styles.hero}>
      <div className={styles.logo}>KA</div>
      <h1 className={styles.title}>{home?.title ?? "Kendall Adkins"}</h1>
      <p className={styles.tagline}>
        {home?.tagline ?? "Senior Software Engineer"}
      </p>
      <nav className={styles.nav}>
        <Link href="/about" className={styles.navLink}>
          About
        </Link>
        <Link href="/work" className={styles.navLink}>
          Work
        </Link>
      </nav>
    </section>
  );
}
```

- [ ] **Step 3: Commit home page**

```bash
git add src/app/\(portfolio\)/page.tsx src/app/\(portfolio\)/page.module.css
git commit -m "implement hero-only home page"
```

---

### Task 4.3: Update About Page

**Files:**

- Modify: `src/app/(portfolio)/about/page.tsx`
- Modify: `src/app/(portfolio)/about/page.module.css`

- [ ] **Step 1: Create new about page.module.css**

```css
.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.title {
  font-family: var(--font-serif), Georgia, serif;
  font-size: clamp(28px, 5vw, 40px);
  font-weight: 700;
  margin-bottom: 32px;
}

.bio {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 48px;
}

.bio p {
  margin-bottom: 16px;
}

.section {
  margin-bottom: 32px;
}

.sectionTitle {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
```

- [ ] **Step 2: Update about page.tsx**

```tsx
import type { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../keystatic.config";
import Tag from "@/components/Tag";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Kendall Adkins - skills, hobbies, and background.",
};

export default async function AboutPage() {
  const reader = createReader(process.cwd(), config);
  const about = await reader.singletons.about.read();
  const bioResult = about ? await about.bio() : null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About</h1>

      {bioResult && (
        <div className={styles.bio}>{renderMarkdoc(bioResult)}</div>
      )}

      {about?.skills && about.skills.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.tags}>
            {about.skills.map((skill) => (
              <Tag key={skill} variant="skill">
                {skill}
              </Tag>
            ))}
          </div>
        </section>
      )}

      {about?.hobbies && about.hobbies.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hobbies</h2>
          <div className={styles.tags}>
            {about.hobbies.map((hobby) => (
              <Tag key={hobby} variant="hobby">
                {hobby}
              </Tag>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit about page**

```bash
git add src/app/\(portfolio\)/about/page.tsx src/app/\(portfolio\)/about/page.module.css
git commit -m "update about page with skills and hobbies"
```

---

### Task 4.4: Create Work Listing Page

**Files:**

- Create: `src/app/(portfolio)/work/page.tsx`
- Create: `src/app/(portfolio)/work/page.module.css`

- [ ] **Step 1: Create work page.module.css**

```css
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.title {
  font-family: var(--font-serif), Georgia, serif;
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 700;
  margin-bottom: 40px;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

@media (max-width: 767px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Create work page.tsx**

```tsx
import { createReader } from "@keystatic/core/reader";
import config from "../../../../keystatic.config";
import WorkCard from "@/components/WorkCard";
import styles from "./page.module.css";

export default async function WorkPage() {
  const reader = createReader(process.cwd(), config);
  const workItems = await reader.collections.work.all();

  const sortedItems = workItems.sort((a, b) => {
    const dateA = a.entry.date ? new Date(a.entry.date).getTime() : 0;
    const dateB = b.entry.date ? new Date(b.entry.date).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Projects, Hobbies, and Writing</h1>
      <div className={styles.grid}>
        {sortedItems.map((item) => (
          <WorkCard
            key={item.slug}
            slug={item.slug}
            title={item.entry.title}
            description={item.entry.description}
            type={item.entry.type}
            image={item.entry.image ?? null}
            externalUrl={item.entry.externalUrl ?? null}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create work directory structure**

```bash
mkdir -p src/app/\(portfolio\)/work
```

- [ ] **Step 4: Commit work listing page**

```bash
git add src/app/\(portfolio\)/work/
git commit -m "add work listing page with grid layout"
```

---

### Task 4.5: Create Work Detail Page

**Files:**

- Create: `src/app/(portfolio)/work/[slug]/page.tsx`
- Create: `src/app/(portfolio)/work/[slug]/page.module.css`

- [ ] **Step 1: Create work detail page.module.css**

```css
.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.backLink {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.backLink:hover {
  color: var(--accent);
}

.header {
  margin-bottom: 32px;
}

.titleRow {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.title {
  font-family: var(--font-serif), Georgia, serif;
  font-size: clamp(28px, 5vw, 40px);
  font-weight: 700;
}

.image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 32px;
}

.content {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.content p {
  margin-bottom: 16px;
}

.content h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 32px 0 16px;
}

.content h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 24px 0 12px;
}

.content a {
  color: var(--accent);
}

.content a:hover {
  text-decoration: underline;
}

.content code {
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}

.content pre {
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.content pre code {
  background: none;
  padding: 0;
}

.externalLink {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 12px 20px;
  background: var(--accent);
  color: var(--bg-primary);
  border-radius: 6px;
  font-weight: 500;
}

.externalLink:hover {
  opacity: 0.9;
  color: var(--bg-primary);
}
```

- [ ] **Step 2: Create work detail page.tsx**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createReader } from "@keystatic/core/reader";
import { renderMarkdoc } from "@/lib/renderMarkdoc";
import config from "../../../../../keystatic.config";
import Tag from "@/components/Tag";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

const reader = createReader(process.cwd(), config);

export async function generateStaticParams() {
  const items = await reader.collections.work.all();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await reader.collections.work.read(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
      type: "article",
      images: item.image ? [item.image] : [],
    },
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await reader.collections.work.read(slug);

  if (!item) {
    notFound();
  }

  const contentResult = await item.content();

  return (
    <div className={styles.container}>
      <Link href="/work" className={styles.backLink}>
        &larr; Back to Work
      </Link>

      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{item.title}</h1>
          <Tag variant={item.type}>{item.type}</Tag>
        </div>
      </header>

      {item.image && (
        <Image
          src={item.image}
          alt=""
          width={1200}
          height={675}
          className={styles.image}
          priority
        />
      )}

      {contentResult && (
        <article className={styles.content}>
          {renderMarkdoc(contentResult)}
        </article>
      )}

      {item.externalUrl && (
        <a
          href={item.externalUrl}
          className={styles.externalLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Live &rarr;
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create directory structure**

```bash
mkdir -p src/app/\(portfolio\)/work/\[slug\]
```

- [ ] **Step 4: Commit work detail page**

```bash
git add src/app/\(portfolio\)/work/\[slug\]/
git commit -m "add work detail page with content rendering"
```

---

## Chunk 5: Cleanup and Finalization

### Task 5.1: Switch to New Design System

**Files:**

- Modify: `src/app/globals.css`
- Delete: `src/app/globals-new.css`

- [ ] **Step 1: Replace globals.css with new design system**

Copy contents of `globals-new.css` to `globals.css`:

```bash
cp src/app/globals-new.css src/app/globals.css
```

- [ ] **Step 2: Delete temporary file**

```bash
rm src/app/globals-new.css
```

- [ ] **Step 3: Commit design system switch**

```bash
git add src/app/globals.css
git rm src/app/globals-new.css
git commit -m "switch to new warm design system"
```

---

### Task 5.2: Remove Deprecated Routes and Components

**Files:**

- Delete: `src/app/(portfolio)/blog/`
- Delete: `src/app/(portfolio)/projects/`
- Delete: `src/app/(portfolio)/contact/`
- Delete: `src/app/api/contact/`
- Delete: `src/components/Nav.tsx`
- Delete: `src/components/Nav.module.css`
- Delete: `src/components/Nav.test.tsx`
- Delete: `src/components/PostCard.tsx`
- Delete: `src/components/PostCard.module.css`
- Delete: `src/components/ProjectCard.tsx`
- Delete: `src/components/ProjectCard.module.css`

- [ ] **Step 1: Remove deprecated routes**

```bash
rm -rf src/app/\(portfolio\)/blog
rm -rf src/app/\(portfolio\)/projects
rm -rf src/app/\(portfolio\)/contact
rm -rf src/app/api/contact
```

- [ ] **Step 2: Remove deprecated components**

```bash
rm src/components/Nav.tsx
rm src/components/Nav.module.css
rm src/components/Nav.test.tsx
rm src/components/PostCard.tsx
rm src/components/PostCard.module.css
rm src/components/ProjectCard.tsx
rm src/components/ProjectCard.module.css
```

- [ ] **Step 3: Remove FadeInObserver if not needed**

Check if FadeInObserver is used in new layout. If not:

```bash
rm src/components/FadeInObserver.tsx
```

- [ ] **Step 4: Commit cleanup**

```bash
git add -A
git commit -m "remove deprecated routes and components"
```

---

### Task 5.3: Remove Old Content Files

**Files:**

- Delete: `content/posts/`
- Delete: `content/projects/`

- [ ] **Step 1: Remove old content directories**

```bash
rm -rf content/posts
rm -rf content/projects
```

- [ ] **Step 2: Commit content cleanup**

```bash
git add -A
git commit -m "remove old content directories"
```

---

### Task 5.4: Verify Build and Test

**Files:**

- None (verification)

- [ ] **Step 1: Run build**

Run: `pnpm build`
Expected: Build completes successfully

- [ ] **Step 2: Run dev server and test manually**

Run: `pnpm dev`

Test:

- Home page loads with hero
- About page shows bio, skills, hobbies
- Work page shows grid of items
- Work detail pages load correctly
- Social icons in footer work
- Responsive on mobile viewport

- [ ] **Step 3: Commit any fixes**

If any issues found, fix and commit.

---

### Task 5.5: Final Commit and Summary

**Files:**

- None (git operation)

- [ ] **Step 1: Create summary commit**

If any final adjustments needed:

```bash
git add -A
git commit -m "finalize portfolio redesign"
```

- [ ] **Step 2: Verify branch status**

Run: `git log --oneline -10`
Expected: See all commits for redesign

---

## Success Criteria

- [ ] Site loads with new warm design on all breakpoints
- [ ] Home page shows hero with KA logo, title, tagline, nav links
- [ ] About page shows bio, skills tags, hobbies tags
- [ ] Work page displays all items with correct type tags
- [ ] Work detail pages render with back link and content
- [ ] Social icons in footer link correctly
- [ ] Keystatic admin allows adding/editing work items
- [ ] No TypeScript or build errors
- [ ] Mobile-first layout works on 375px viewport
