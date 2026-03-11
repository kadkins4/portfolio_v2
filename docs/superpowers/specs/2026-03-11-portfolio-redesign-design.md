# Portfolio Redesign - Design Specification

**Date**: 2026-03-11
**Status**: Approved
**Branch**: TBD (create before implementation)

## Overview

Redesign the existing Next.js portfolio site to be simpler and more focused. The new design emphasizes a warm, minimal aesthetic with mobile-first responsive layouts. The Keystatic CMS backend is retained but simplified.

## Goals

1. Showcase who Kendall is and their work (projects, hobbies, writing)
2. Replace contact form with social media links
3. Simplify site structure from 5 pages to 3 main pages
4. Implement warm, minimal visual design
5. Mobile-first responsive design
6. Retain Keystatic CMS for content management

## Site Structure

### Pages

| Route          | Purpose                                                   |
| -------------- | --------------------------------------------------------- |
| `/`            | Home - Hero with name, tagline, navigation, social footer |
| `/about`       | About - Bio, skills tags, hobbies tags                    |
| `/work`        | Work - Unified feed of projects, hobbies, and writing     |
| `/work/[slug]` | Individual work item detail page                          |
| `/keystatic`   | CMS admin (hidden from navigation)                        |

### Removed Routes

- `/blog` - Merged into `/work`
- `/contact` - Replaced with social links in footer
- `/projects` - Merged into `/work`

## Design System

### Color Palette

```css
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

  /* Page gradient */
  --gradient-page: linear-gradient(
    180deg,
    #0d0b09 0%,
    #0f0d0a 50%,
    #12100d 100%
  );
}
```

### Tag Colors

| Type    | Background             | Text              |
| ------- | ---------------------- | ----------------- |
| Project | `#a08060` (gold)       | Dark (`#0d0b09`)  |
| Writing | `#6a645c` (muted)      | Light (`#ebe6e0`) |
| Hobby   | `#705a40` (warm brown) | Light (`#ebe6e0`) |

### Typography

| Element   | Font             | Fallbacks                    |
| --------- | ---------------- | ---------------------------- |
| Name/Logo | Playfair Display | Source Serif, Georgia, serif |
| Headings  | Inter            | system-ui, sans-serif        |
| Body      | Inter            | system-ui, sans-serif        |

**Logo**: "KA" in serif font on all screen sizes.

### Breakpoints

| Name    | Width   | Behavior                           |
| ------- | ------- | ---------------------------------- |
| Mobile  | 375px+  | Single column, stacked layouts     |
| Tablet  | 768px+  | Two-column grids where appropriate |
| Desktop | 1024px+ | Full layouts with sidebars         |
| Large   | 1280px+ | Max content width ~700px, centered |

## Page Layouts

### Home Page

**Hero only** - Clean and focused entry point.

**Content**:

- Logo: "KA" (serif)
- Title: "Kendall Adkins"
- Tagline: Brief one-line description
- Navigation: About | Work (text links, not buttons)
- Footer: Social icons (GitHub, LinkedIn, Instagram)

**Mobile layout**: Centered, stacked vertically.

### About Page

**Sections**:

1. **Header**: "KA" logo + navigation
2. **Bio**: Prose description (from Markdoc)
3. **Skills**: Horizontal tag list
4. **Hobbies**: Horizontal tag list
5. **Footer**: Social icons

### Work Page

**Title**: "Projects, Hobbies, and Writing"

**Content display**: Unified feed with type tags indicating category.

**Desktop layout**: Two-column grid of cards.

**Mobile layout**: Single column, image-first stacked cards.

### Work Item Card

**Desktop flow**:

```
[Image (optional)] [Tag]
[Title]
[Description]
[View Live →] (if external link exists)
```

**Mobile flow** (image-first):

```
┌─────────────────────────┐
│                         │
│        [Image]          │
│                         │
│  [Tag] ←── top-right    │
└─────────────────────────┘
[Title]
[Description]
[View Live →]
```

**Fields**:

- Title (required)
- Description (required)
- Type: project | writing | hobby (required)
- Image (optional)
- External URL (optional)
- Content body (Markdoc)

### Work Detail Page

- Header with logo + navigation
- Title + type tag
- Featured image (if exists)
- Full content body
- Back link to work listing
- Footer with social icons

## Components

### Header

- Logo: "KA" (left-aligned)
- Navigation: Text links (right-aligned, no hamburger menu needed)
- Minimal height, subtle border-bottom

### Footer

- Social icons: GitHub, LinkedIn, Instagram (SVG)
- Centered, subtle styling
- Consistent across all pages

### Navigation

Simple text links with subtle hover state (underline or color shift to accent).

### Tags

Small pill-shaped elements with category-specific colors. Used for:

- Work item types (Project, Writing, Hobby)
- Skills on About page
- Hobbies on About page

### Cards

Work item cards with:

- Optional image with overlay tag
- Title
- Description excerpt
- Optional "View Live" link

## Content Schema (Keystatic)

### Singletons

**home.yaml**

```yaml
title: string
tagline: string
```

**about.yaml**

```yaml
bio: markdoc (reference to bio.mdoc)
skills: string[]
hobbies: string[]
```

### Collections

**work** (replaces separate projects and posts collections)

```yaml
title: string
description: string
type: 'project' | 'writing' | 'hobby'
image: image (optional)  # Recommended: 16:9 aspect ratio, 1200x675px
externalUrl: url (optional)
date: date
content: markdoc
```

Note: Image dimensions are not enforced, but Keystatic should display a recommendation for 16:9 aspect ratio (1200x675px) in the admin UI description.

## Social Links

Displayed as SVG icons in footer:

- GitHub: https://github.com/kadkins4
- LinkedIn: https://www.linkedin.com/in/adkinskendall/
- Instagram: https://www.instagram.com/kadkins4/

Icons should be monochrome (text-secondary) with hover state (accent color).

## Technical Approach

### Stack (unchanged)

- Next.js 16.x with App Router
- React 19.x
- TypeScript 5.x
- Keystatic CMS

### CSS Approach

- CSS custom properties for theming
- Mobile-first media queries
- Minimal dependencies (no CSS framework required)

### Migration Steps

1. Create feature branch
2. Update Keystatic schema (merge projects + posts → work)
3. Migrate existing content to new schema
4. Implement new design system (colors, typography)
5. Build new page layouts
6. Build new components (header, footer, cards, tags)
7. Remove deprecated routes
8. Test responsive behavior
9. Verify Keystatic admin still functions
10. Merge to main

## Success Criteria

- [ ] Site loads with new design on all breakpoints
- [ ] Work page displays all items with correct tags
- [ ] Individual work pages render correctly
- [ ] Keystatic admin allows adding/editing work items
- [ ] Social links work correctly
- [ ] No broken routes or 404s for valid content
- [ ] Mobile-first layout renders correctly on 375px viewport

## Out of Scope

- RSS feed (can be removed or kept as-is)
- SEO/JSON-LD (keep existing implementation)
- Dark/light theme toggle (dark only)
- Analytics
- Comments system
