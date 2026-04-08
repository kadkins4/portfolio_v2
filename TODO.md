# Launch Checklist

## Content

- [x] Replace placeholder projects with real projects
- [x] Replace placeholder blog posts with real content (or delete them)
- [x] Fill out About page bio and skills
- [x] Update social links in Site Settings
- [x] Add resume PDF to `/public`

## Environment & Config

- [x] Purchase domain — kendalladkins.dev
- [x] Configure DNS (A record + CNAME for Vercel)
- [x] Verify domain in `next-sitemap.config.js` matches actual domain
- [x] Block /keystatic in production
- [x] Add Vercel Analytics
- [ ] Set up [Resend](https://resend.com) account for contact form emails
- [ ] Get `RESEND_API_KEY`
- [ ] Decide on `CONTACT_EMAIL` (where form submissions go)

## Pre-Launch Testing

- [x] Test production build locally (`pnpm build && pnpm start`)
- [x] Verify all images load
- [x] Check all navigation links (internal + external)
- [ ] Test on mobile — responsive layout check
- [ ] Test contact form sends real email (with Resend API key set)
- [ ] Share a page URL to preview OG image

## Deploy

1. [x] Sign up at [vercel.com](https://vercel.com) with GitHub
2. [x] Import `portfolio_v2` repo → Deploy
3. [ ] Set env vars: `RESEND_API_KEY`, `CONTACT_EMAIL`
4. [x] Add `kendalladkins.dev` domain in Vercel dashboard
5. [x] Verify HTTPS works

## Post-Launch

- [ ] Submit sitemap to [Google Search Console](https://search.google.com/search-console) (`https://kendalladkins.dev/sitemap.xml`)
- [ ] Verify ownership (DNS TXT record or HTML file)
- [ ] Request indexing for homepage
- [ ] Test live contact form

### Backlinks

- [x] **LinkedIn** — Add website in Contact Info section
- [ ] **GitHub profile README** — see steps below

### GitHub Profile README Setup

Draft is saved at `docs/github-profile-README.md`. To set it up:

1. [ ] Go to [github.com/new](https://github.com/new) (on your personal account, not EMU)
2. [ ] Create a **public** repo named exactly after your GitHub username (e.g. `kadkins4`)
3. [ ] Check "Add a README file"
4. [ ] Copy the contents of `docs/github-profile-README.md` into the repo's `README.md`
5. [ ] Commit — it will automatically show on your GitHub profile
6. [ ] While you're there, add `https://kendalladkins.dev` to your profile's Website field

### Optional

- [ ] Update README to be more attractive/engaging
- [ ] Add canonical URLs to metadata
- [ ] Create a Google Business Profile

---

## Content Updates (Local Workflow)

Since Keystatic uses local storage:

1. Run `pnpm dev` locally
2. Go to http://localhost:3000/keystatic
3. Make edits
4. Commit and push changes
5. Vercel auto-deploys from main branch
