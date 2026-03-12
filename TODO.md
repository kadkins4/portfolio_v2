# Launch Checklist

## Domain

- [ ] **Purchase domain** — kendalladkins.com (or similar)
  - Registrar options: Namecheap, Cloudflare, Porkbun, Squarespace (Google Domains)
  - Cloudflare has at-cost pricing with no markup

## Pre-Launch

- [x] **Block /keystatic in production** — Middleware added to redirect to home
- [ ] **Test production build locally** — Run `pnpm build && pnpm start` to verify everything works
- [ ] **Verify all images load** — Check work cards and detail pages
- [ ] **Test on mobile** — Responsive layout check
- [ ] **Check all links** — Internal navigation and external URLs

## Hosting (Vercel)

1. [ ] Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. [ ] Click "Add New Project" and import `portfolio_v2` repo
3. [ ] Vercel auto-detects Next.js — click Deploy
4. [ ] Once deployed, go to Settings → Domains → Add your domain
5. [ ] Update DNS at your registrar:
   - A record: `76.76.21.21`
   - Or CNAME: `cname.vercel-dns.com`
6. [ ] HTTPS is automatic — verify site loads with https://

Alternative hosts: Netlify, Cloudflare Pages

## SEO & Discoverability

### Google Search Console

- [ ] Go to [Google Search Console](https://search.google.com/search-console)
- [ ] Add property for your domain
- [ ] Verify ownership (DNS TXT record or HTML file)
- [ ] Submit sitemap: https://yourdomain.com/sitemap.xml
- [ ] Request indexing for homepage

### Backlinks (links from other sites to yours)

- [ ] **GitHub profile** — Add website URL to profile and README
- [ ] **LinkedIn** — Add website in Contact Info section
- [ ] **Twitter/X** — Add website URL to bio
- [ ] **Stack Overflow** — Add website to profile (if you have one)
- [ ] **Dev.to / Hashnode** — Link to portfolio in bio (if applicable)

### Optional Enhancements

- [ ] Add canonical URLs to metadata (minor improvement)
- [ ] Set up Google Analytics or Plausible for traffic insights
- [ ] Create a Google Business Profile (for knowledge panel presence)

## Post-Launch

- [ ] Test site in Google Search — Search "site:yourdomain.com" after a few days
- [ ] Monitor Search Console for crawl errors
- [ ] Check Core Web Vitals in Search Console once data is available

---

## Content Updates (Local Workflow)

Since Keystatic uses local storage:

1. Run `pnpm dev` locally
2. Go to http://localhost:3000/keystatic
3. Make edits
4. Commit and push changes
5. Vercel auto-deploys from main branch
