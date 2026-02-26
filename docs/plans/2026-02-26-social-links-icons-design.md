# Social Links Icons & CMS Design

**Date:** 2026-02-26

## Summary

Replace hardcoded text social links with icon-based links managed via Keystatic. Add social links to the Contact page header and make the "Available for work" badge on the home page link to /contact.

## Requirements

1. Social links display inline SVG icons instead of text labels
2. Social link data (platform, URL, placement visibility) is managed in Keystatic
3. Social links appear at the top of the Contact page
4. "Available for work" badge on home page links to /contact

## Architecture

### Keystatic: `siteSettings` singleton

Add a new singleton to `keystatic.config.ts`:

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
      { label: "Social Links", itemLabel: (props) => props.fields.platform.value ?? "Link" }
    ),
  },
})
```

### `SocialLinks` component (`src/components/SocialLinks.tsx`)

- Accepts `links` (pre-filtered array from Keystatic) and optionally a `className`
- Renders each link as `<a>` with inline SVG icon and `aria-label`
- For `platform: "email"`, prepends `mailto:` to the URL
- Icons: GitHub, Instagram, Reddit, LinkedIn, Email — all inline SVG

### Footer

- Reads `siteSettings` from Keystatic, filters by `showInFooter: true`
- Passes filtered links to `<SocialLinks />`
- Becomes an async server component

### Contact page

- Reads `siteSettings` from Keystatic, filters by `showInContact: true`
- Renders `<SocialLinks />` between the intro paragraph and the form
- Contact page is currently `"use client"` — social data must be read in a parent server component or layout and passed as props

### Home page badge

- Wrap the existing `<span className={styles.badge}>` with `<Link href="/contact">`
- Add hover/focus styles so it reads as interactive

## Data

Seed `content/site-settings.json` with current hardcoded links:
- GitHub → https://github.com, showInFooter: true, showInContact: true
- Instagram → https://instagram.com, showInFooter: true, showInContact: true
- Reddit → https://reddit.com, showInFooter: true, showInContact: true
- LinkedIn → https://linkedin.com, showInFooter: true, showInContact: true
- Email → hello@kendalladkins.com, showInFooter: true, showInContact: true

## Notes

- No icon library needed — inline SVGs keep bundle lean
- Contact page `"use client"` constraint: extract social link reading into the contact layout or a new server wrapper component, pass links as props to the client form component
- Footer becomes async (was previously synchronous) — acceptable pattern in Next.js App Router
