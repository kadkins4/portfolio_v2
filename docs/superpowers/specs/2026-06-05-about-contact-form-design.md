# About Page — Direct Contact Form

**Date:** 2026-06-05
**Status:** Approved design, ready for implementation plan

## Goal

Give visitors a way to reach Kenny directly from the About page's "Want to work
together?" card without going through LinkedIn, GitHub, or Instagram — and
without exposing his real email address. The social icons stay. The form is
hidden by default to save vertical space and reveals on intent.

## Decisions

| Area         | Decision                                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delivery     | Formspree (email address never appears in the page or markup)                                                                                               |
| Disclosure   | Pattern A — inline accordion inside the existing card                                                                                                       |
| Trigger      | "Send a message" button; fades out when the form opens                                                                                                      |
| Close        | Form-header × — the open form starts with a "Send a message" header row and a circular × button on its right (spring/rotate-in animation, rotates on hover) |
| Fields       | Name (required), Email (optional), Message (required)                                                                                                       |
| Contact hint | Soft line under Message: "No email? Leave another way to reach you in the message."                                                                         |
| Submit       | Inline AJAX POST to Formspree; card swaps to a success message without leaving the page                                                                     |
| Spam         | Formspree built-in + a hidden `_gotcha` honeypot field                                                                                                      |

### Why Email is optional

Kenny's call: if a sender omits their email, he assumes they've left a phone
number or other contact method in the message body. The hint nudges them to do
so. Name and Message stay required so every submission has a sender and a point.

## Architecture

The About page (`src/app/(portfolio)/about/page.tsx`) is a server component. The
form needs client-side state (open/closed toggle, async submit, success/error
state), so the interactive piece becomes a new **client component**.

### New component: `ContactForm`

- `src/components/ContactForm.tsx` (`"use client"`)
- `src/components/ContactForm.module.css` (co-located, matching existing module convention)

**Responsibility:** render the "Send a message" trigger and the collapsible
Formspree form, including its header/close row, fields, submit handling, and
success/error states. One clear purpose: the contact interaction.

**Props:**

```ts
type Props = {
  formspreeEndpoint: string; // full https://formspree.io/f/{id} URL
};
```

**What stays in `page.tsx`:** the `.cta` card wrapper, the title, the intro
paragraph, the "or find me on" divider, and `<SocialLinks />`. The page renders
`<ContactForm formspreeEndpoint={...} />` between the intro and the divider. This
keeps the social links exactly where they are and limits the client boundary to
the form alone.

### Formspree endpoint

- Stored as `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (or the bare form id) in env.
  `NEXT_PUBLIC_` because the POST happens client-side. This is not a secret —
  Formspree endpoints are public by design; the value being public is what keeps
  Kenny's actual inbox address hidden.
- `page.tsx` reads it and passes it to `ContactForm`. If unset, the form
  trigger is hidden / disabled gracefully (the card still renders with socials).

## Interaction & states

**Collapsed (default):** title, intro, centered "Send a message" button,
divider, socials. No form in the DOM flow height.

**Opening:** button fades + scales out; the accordion panel animates open
(`max-height` + `opacity` + `margin` transition, ~0.45s ease). Panel begins with
a header row — "Send a message" heading on the left, circular × on the right.
The × animates in and rotates 90° on hover. Focus moves to the Name field.

**Closing:** × (or Esc) collapses the panel and fades the trigger button back
in. Focus returns to the trigger button.

**Submitting:** `fetch` POST to the Formspree endpoint with
`Accept: application/json` and the form data.

- **Success (res.ok):** replace the form body with "Thanks — I'll be in touch
  soon." Trigger stays hidden; card height settles.
- **Error:** inline error message under the submit button ("Something went wrong
  — please try again or reach me on the links below."), form stays editable.
- **In-flight:** submit button disabled, label → "Sending…".

## Validation

- Name: `required`.
- Message: `required` (textarea).
- Email: optional; `type="email"` so the browser validates format only if filled.
- Honeypot `_gotcha` hidden field; bots that fill it are dropped by Formspree.

## Accessibility

- Trigger button: `aria-expanded`, `aria-controls` pointing at the panel.
- Panel: labelled region; close button has `aria-label="Close form"`.
- Focus management: into the form on open, back to trigger on close.
- `Escape` closes the open form.
- `prefers-reduced-motion`: drop the spring/scale/rotate and slide animations,
  snap open/closed instead.

## Styling

Reuse the existing palette tokens (`--bg`, `--accent`, `--text`, `--text2`,
`--muted`, `--border`, `--border2`) and the card's existing look. The `.cta`
card styling in `about/page.module.css` is unchanged; new form/accordion/close
styles live in `ContactForm.module.css`. Inputs use `--bg-secondary` fills with
`--border`, focus border `--accent`. Submit button matches the existing accent
button style.

## Out of scope (YAGNI)

- Subject field / project-type dropdown.
- File uploads / attachments.
- Custom server route or self-hosted email — Formspree handles delivery.
- reCAPTCHA — Formspree's built-in spam filtering + honeypot is enough for this
  volume.

## Testing

- Component renders collapsed by default; trigger toggles the panel.
- Required validation blocks submit when Name or Message empty; email format
  validates only when provided.
- Successful POST (mocked fetch) shows the success state; failed POST shows the
  error state and keeps the form editable.
- Honeypot field present and visually hidden.
- Reduced-motion path skips animation.
