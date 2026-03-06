# Launch Plan

## Pre-Launch Checklist

### Content (via `/keystatic`)

- [ ] Replace placeholder projects ("test") with 2-3 real projects
- [ ] Replace placeholder blog posts with real content (or delete them)
- [ ] Fill out About page bio and skills
- [ ] Update social links in Site Settings

### Environment & Config

- [ ] Set up [Resend](https://resend.com) account for contact form emails
- [ ] Get your `RESEND_API_KEY`
- [ ] Decide on your `CONTACT_EMAIL` (where form submissions go)
- [ ] Verify domain in `next-sitemap.config.js` matches your actual domain

### Final Testing

- [ ] Test contact form sends real email (with Resend API key set)
- [ ] Click through every page on mobile
- [ ] Test all navigation links
- [ ] Share a page URL in Slack/Discord to preview OG image

---

## Launch

### 1. Deploy to Vercel (easiest for Next.js)

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com)

### 2. Set environment variables in Vercel

- `RESEND_API_KEY` — your Resend API key
- `CONTACT_EMAIL` — your email address

### 3. Connect your domain

- Add `kendalladkins.com` in Vercel dashboard
- Update DNS records as instructed

### 4. Post-launch

- [ ] Submit sitemap to [Google Search Console](https://search.google.com/search-console) (`https://kendalladkins.com/sitemap.xml`)
- [ ] Test live contact form
- [ ] Share on LinkedIn/Twitter with your new OG image

---

## Quick Deploy

```bash
# Deploy to production
vercel --prod
```
