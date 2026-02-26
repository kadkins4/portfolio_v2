# Portfolio Refactor Design
**Date:** 2026-02-25
**Status:** Approved

---

## Overview

Refactor the existing single-file `portfolio.jsx` into a full Next.js 15 multi-page site with a Keystatic-powered content dashboard, mobile-first design, and SEO best practices throughout. Deploy to Vercel (free tier).

---

## Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSG per page, SEO-ready, React-native |
| Content | Keystatic | Markdown dashboard at `/keystatic`, files in repo |
| Styling | CSS Modules + global CSS | Existing theme migrates cleanly, scoped per component |
| Deployment | Vercel (free) | Zero-config Next.js hosting, preview URLs per branch |
| Contact form | Next.js API Route + Resend | Free tier (3k emails/month) |
| Language | TypeScript | Type safety as project grows |
| Fonts | `next/font` | Self-hosted, no render-blocking requests |
| Images | `next/image` | WebP, lazy loading, correct sizing |
| Sitemap | `next-sitemap` | Auto-generates `sitemap.xml` + `robots.txt` at build |

---

## Pages

```
/                        Home (hero)
/about                   About + skills
/projects                Projects listing
/projects/[slug]         Project detail page
/blog                    Blog listing (date, excerpt, read time)
/blog/[slug]             Individual post
/contact                 Contact form
/keystatic               Admin dashboard (Keystatic UI, dev-only in prod)
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Nav, Footer, global metadata
│   ├── page.tsx                      # Home
│   ├── about/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── contact/page.tsx
│   ├── api/
│   │   └── contact/route.ts          # Resend email handler
│   └── keystatic/[[...params]]/page.tsx
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── ProjectCard.tsx
│   └── PostCard.tsx
├── content/
│   ├── projects/                     # .mdoc files (Keystatic)
│   └── posts/
├── public/
│   ├── images/
│   │   ├── projects/                 # Cover images for projects
│   │   └── posts/                    # Cover images for posts
│   ├── sitemap.xml                   # Auto-generated
│   └── robots.txt                    # Auto-generated
├── styles/
│   ├── globals.css                   # Theme variables, base reset, animations
│   └── *.module.css                  # Per-component scoped styles
├── keystatic.config.ts               # Content schema definition
└── next.config.ts
```

---

## Content Model (Keystatic)

### Collections

**`projects`**
```
slug           string   — URL segment (/projects/design-system)
title          string
description    string   — short, used on listing cards + SEO
tags           string[]
date           date
featured       boolean  — show on home page
liveUrl        string   (optional)
repoUrl        string   (optional)
coverImage     image    (optional) → public/images/projects/
content        markdown — full case study body
```

**`posts`**
```
slug           string   — URL segment (/blog/my-post)
title          string
excerpt        string   — used on listing + meta description
date           date
tags           string[]
coverImage     image    (optional) → public/images/posts/
content        markdown
```

### Singletons

**`home`**
```
badge          string   ("Available for work")
headline       string
subheading     string
```

**`about`**
```
bio            markdown — replaces hardcoded paragraphs
skills         string[]  — replaces hardcoded skills array
```

---

## SEO

- `generateMetadata()` on every page — unique `title`, `description`, Open Graph, Twitter Card
- Dynamic routes (`/blog/[slug]`, `/projects/[slug]`) generate metadata from Keystatic content
- JSON-LD structured data:
  - `Person` schema on home/about
  - `Article` schema on blog posts
  - `CreativeWork` on project pages
- `next-sitemap` generates `sitemap.xml` + `robots.txt` at build time
- RSS feed at `/feed.xml` for blog
- `ImageResponse` for auto-generated branded OG images per page
- Canonical URLs set on every page

---

## Mobile

- **Mobile-first CSS** — base styles target mobile, scale up with `min-width` breakpoints (replaces current desktop-first `max-width` approach)
- **Touch targets** — all interactive elements minimum 44×44px
- **Font sizes** — minimum 16px for body text; current 13–14px sizes on mobile will be increased
- **Mobile menu** — slide-down animation with backdrop, replaces hard show/hide
- **iOS scrolling** — `-webkit-overflow-scrolling: touch` where applicable

---

## Accessibility Fixes (from existing code)

| Issue | Fix |
|---|---|
| `role="menu"` on mobile nav | Replace with `<nav>` + plain links |
| `tabIndex="0"` on non-interactive project cards | Remove; cards become `<a>` links to detail page |
| `role="status"` on hero badge | Change to `<span>` |
| Missing `aria-controls` on mobile toggle | Add `aria-controls` pointing to menu element ID |
| Muted text contrast (`#555570`) | Lighten to pass WCAG AA (4.5:1 ratio) |
| No `prefers-reduced-motion` | Add `@media (prefers-reduced-motion: reduce)` to disable animations |

---

## Performance

- `next/font` replaces `@import` Google Fonts (eliminates render-blocking)
- `next/image` for all cover images (WebP, lazy load, no layout shift)
- Hero glow `filter: blur(60px)` gets `will-change: transform` to promote to GPU layer
- All pages statically generated at build — no runtime data fetching
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms

---

## Contact Form

- `/contact` page with name, email, message fields
- Posts to `/api/contact` Next.js API route
- API route sends via Resend (free tier, 3k emails/month)
- Netlify Forms considered but Vercel is the deploy target — Resend is the fit
- Form includes honeypot field for basic spam prevention

---

## Deployment

- **Host:** Vercel (free tier)
- **Trigger:** push to `main` → automatic deploy
- **Previews:** every PR/branch gets a preview URL
- **Environment variables:** `RESEND_API_KEY` set in Vercel dashboard
- **Keystatic in production:** admin UI disabled in prod by default (can re-enable with auth if needed)
