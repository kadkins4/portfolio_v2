# About Page Contact Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hidden-by-default, Formspree-backed contact form to the About page's "Want to work together?" card so visitors can message Kenny directly without exposing his email, while keeping the existing social links.

**Architecture:** A new `"use client"` `ContactForm` component renders a "Send a message" trigger and an inline accordion form inside the existing `.cta` card. The About page stays a server component, reads the Formspree endpoint from an env var, and passes it as a prop. The form submits via client-side `fetch` (AJAX) to Formspree and swaps to a success state without leaving the page. The social links and divider stay in `page.tsx`.

**Tech Stack:** Next.js 16 (App Router), React 19.2 (uses the `inert` prop), CSS Modules, Vitest + Testing Library + jsdom, Formspree.

---

## File Structure

- **Create** `src/components/ContactForm.tsx` — client component: trigger button + collapsible Formspree form, submit handling, success/error states. Single responsibility: the contact interaction.
- **Create** `src/components/ContactForm.module.css` — styling + open/close + close-button animations, scoped to this component.
- **Create** `src/components/ContactForm.test.tsx` — behavior tests (disclosure, validation, submit states, a11y).
- **Modify** `src/app/(portfolio)/about/page.tsx` — read the endpoint env var, render `<ContactForm>` between the intro paragraph and the divider.
- **Create** `.env.example` — document the `NEXT_PUBLIC_FORMSPREE_ENDPOINT` variable.

The component keeps the form mounted at all times (so the accordion can animate its height) and uses React 19's `inert` prop to remove it from the accessibility tree and tab order while collapsed.

---

## Task 1: ContactForm — disclosure, fields, and accessibility (no network)

Build the component's structure and all non-network behavior: the open/close accordion, the form fields with validation attributes, the honeypot, and keyboard/ARIA accessibility. Network submission is added in Task 2.

**Files:**

- Create: `src/components/ContactForm.tsx`
- Test: `src/components/ContactForm.test.tsx`

- [ ] **Step 1: Write the failing disclosure + a11y tests**

Create `src/components/ContactForm.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import ContactForm from "./ContactForm";

const ENDPOINT = "https://formspree.io/f/test123";

describe("ContactForm — disclosure & accessibility", () => {
  it("renders the trigger and starts collapsed (panel inert)", () => {
    render(<ContactForm endpoint={ENDPOINT} />);
    const trigger = screen.getByRole("button", { name: "Send a message" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("contact-panel")).toHaveAttribute("inert");
  });

  it("opens the form when the trigger is clicked", () => {
    render(<ContactForm endpoint={ENDPOINT} />);
    fireEvent.click(screen.getByRole("button", { name: "Send a message" }));
    const trigger = screen.getByRole("button", { name: "Send a message" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("contact-panel")).not.toHaveAttribute("inert");
  });

  it("closes the form with the close button", () => {
    render(<ContactForm endpoint={ENDPOINT} />);
    fireEvent.click(screen.getByRole("button", { name: "Send a message" }));
    fireEvent.click(screen.getByRole("button", { name: "Close form" }));
    expect(
      screen.getByRole("button", { name: "Send a message" })
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("contact-panel")).toHaveAttribute("inert");
  });

  it("closes the form when Escape is pressed", () => {
    render(<ContactForm endpoint={ENDPOINT} />);
    fireEvent.click(screen.getByRole("button", { name: "Send a message" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByTestId("contact-panel")).toHaveAttribute("inert");
  });

  it("moves focus to the Name field when opened", () => {
    render(<ContactForm endpoint={ENDPOINT} />);
    fireEvent.click(screen.getByRole("button", { name: "Send a message" }));
    expect(screen.getByLabelText(/Name/)).toHaveFocus();
  });
});

describe("ContactForm — fields", () => {
  it("requires Name and Message but not Email", () => {
    render(<ContactForm endpoint={ENDPOINT} />);
    fireEvent.click(screen.getByRole("button", { name: "Send a message" }));
    expect(screen.getByLabelText(/Name/)).toBeRequired();
    expect(screen.getByLabelText(/Message/)).toBeRequired();
    expect(screen.getByLabelText(/Email/)).not.toBeRequired();
  });

  it("uses an email input type for Email", () => {
    render(<ContactForm endpoint={ENDPOINT} />);
    fireEvent.click(screen.getByRole("button", { name: "Send a message" }));
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("type", "email");
  });

  it("includes a hidden honeypot field", () => {
    const { container } = render(<ContactForm endpoint={ENDPOINT} />);
    fireEvent.click(screen.getByRole("button", { name: "Send a message" }));
    const honeypot = container.querySelector('input[name="_gotcha"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/ContactForm.test.tsx`
Expected: FAIL — `Failed to resolve import "./ContactForm"` (file does not exist yet).

- [ ] **Step 3: Implement the component (non-network)**

Create `src/components/ContactForm.tsx`:

```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./ContactForm.module.css";

type Props = {
  endpoint: string;
};

export default function ContactForm({ endpoint }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Move focus into the form on open; return it to the trigger on close.
  useEffect(() => {
    if (open) {
      nameRef.current?.focus();
    }
  }, [open]);

  // Escape closes the open form.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeForm();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function openForm() {
    setOpen(true);
  }

  function closeForm() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className={styles.wrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerHidden : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-hidden={open}
        inert={open}
        onClick={openForm}
      >
        Send a message
      </button>

      <div
        id={panelId}
        data-testid="contact-panel"
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        inert={!open}
      >
        <div className={styles.formHeader}>
          <h3 className={styles.formTitle}>Send a message</h3>
          <button
            type="button"
            className={styles.close}
            aria-label="Close form"
            onClick={closeForm}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className={styles.form} action={endpoint} method="POST">
          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            className={styles.honeypot}
          />

          <label className={styles.field}>
            <span className={styles.label}>
              Name <span className={styles.req}>*</span>
            </span>
            <input
              ref={nameRef}
              type="text"
              name="name"
              required
              autoComplete="name"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              Email <span className={styles.opt}>— optional</span>
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              Message <span className={styles.req}>*</span>
            </span>
            <textarea
              name="message"
              required
              rows={4}
              className={styles.textarea}
            />
          </label>

          <p className={styles.hint}>
            No email? Leave another way to reach you in the message.
          </p>

          <button type="submit" className={styles.submit}>
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
```

> Note: `ContactForm.module.css` is created in Task 3. Until then the class names resolve to `undefined`, which is harmless for the behavior tests. If your tooling errors on the missing module, create an empty `src/components/ContactForm.module.css` now and fill it in Task 3.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/ContactForm.test.tsx`
Expected: PASS — all disclosure, focus, Escape, field, and honeypot tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/ContactForm.tsx src/components/ContactForm.test.tsx
git commit -m "Adds ContactForm disclosure, fields, and accessibility"
```

---

## Task 2: ContactForm — Formspree AJAX submit with success/error states

Intercept the submit, POST to Formspree via `fetch`, and render sending / success / error states inline.

**Files:**

- Modify: `src/components/ContactForm.tsx`
- Test: `src/components/ContactForm.test.tsx`

- [ ] **Step 1: Write the failing submit tests**

Append to `src/components/ContactForm.test.tsx`:

```tsx
import { waitFor } from "@testing-library/react";

describe("ContactForm — submission", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function openAndFill() {
    fireEvent.click(screen.getByRole("button", { name: "Send a message" }));
    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/Message/), {
      target: { value: "Hello there" },
    });
  }

  it("POSTs to the Formspree endpoint and shows a success message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<ContactForm endpoint={ENDPOINT} />);
    openAndFill();
    fireEvent.submit(screen.getByTestId("contact-form"));

    await waitFor(() =>
      expect(
        screen.getByText(/Thanks — I'll be in touch soon\./)
      ).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({
        method: "POST",
        headers: { Accept: "application/json" },
      })
    );
    // Form is replaced by the success message.
    expect(screen.queryByLabelText(/Message/)).not.toBeInTheDocument();
  });

  it("shows an error message and keeps the form when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    render(<ContactForm endpoint={ENDPOINT} />);
    openAndFill();
    fireEvent.submit(screen.getByTestId("contact-form"));

    await waitFor(() =>
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    );
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
  });

  it("disables the submit button and shows 'Sending…' while in flight", async () => {
    let resolve: (v: { ok: boolean }) => void = () => {};
    const pending = new Promise<{ ok: boolean }>((r) => (resolve = r));
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));

    render(<ContactForm endpoint={ENDPOINT} />);
    openAndFill();
    fireEvent.submit(screen.getByTestId("contact-form"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled()
    );
    resolve({ ok: true });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/ContactForm.test.tsx`
Expected: FAIL — no `data-testid="contact-form"` element / fetch never called / no success text (the current form does a native POST, not AJAX).

- [ ] **Step 3: Add submit handling to the component**

Replace the entire contents of `src/components/ContactForm.tsx` with:

```tsx
"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import styles from "./ContactForm.module.css";

type Props = {
  endpoint: string;
};

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm({ endpoint }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeForm();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function openForm() {
    setOpen(true);
  }

  function closeForm() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerHidden : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-hidden={open}
        inert={open}
        onClick={openForm}
      >
        Send a message
      </button>

      <div
        id={panelId}
        data-testid="contact-panel"
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        inert={!open}
      >
        <div className={styles.formHeader}>
          <h3 className={styles.formTitle}>Send a message</h3>
          <button
            type="button"
            className={styles.close}
            aria-label="Close form"
            onClick={closeForm}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === "success" ? (
          <p className={styles.success} role="status">
            Thanks — I&apos;ll be in touch soon.
          </p>
        ) : (
          <form
            data-testid="contact-form"
            className={styles.form}
            action={endpoint}
            method="POST"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
              className={styles.honeypot}
            />

            <label className={styles.field}>
              <span className={styles.label}>
                Name <span className={styles.req}>*</span>
              </span>
              <input
                ref={nameRef}
                type="text"
                name="name"
                required
                autoComplete="name"
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                Email <span className={styles.opt}>— optional</span>
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                Message <span className={styles.req}>*</span>
              </span>
              <textarea
                name="message"
                required
                rows={4}
                className={styles.textarea}
              />
            </label>

            <p className={styles.hint}>
              No email? Leave another way to reach you in the message.
            </p>

            {status === "error" && (
              <p className={styles.error} role="alert">
                Something went wrong — please try again or reach me on the links
                below.
              </p>
            )}

            <button
              type="submit"
              className={styles.submit}
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/ContactForm.test.tsx`
Expected: PASS — all Task 1 and Task 2 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/ContactForm.tsx src/components/ContactForm.test.tsx
git commit -m "Adds Formspree AJAX submit with success and error states"
```

---

## Task 3: ContactForm styling and animation

Style the component to match the site palette and the approved interaction: trigger fades out on open, panel animates open via `max-height`, the close × springs/rotates in, and animation is disabled under `prefers-reduced-motion`. This task is CSS-only and verified by lint + the existing tests still passing.

**Files:**

- Create (or fill, if stubbed in Task 1): `src/components/ContactForm.module.css`

- [ ] **Step 1: Write the stylesheet**

Create `src/components/ContactForm.module.css`:

```css
.wrapper {
  position: relative;
  margin-top: 20px;
}

.trigger {
  background: var(--accent);
  color: var(--bg-primary);
  font-size: 14px;
  font-weight: 600;
  padding: 11px 22px;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.trigger:hover {
  filter: brightness(1.08);
}

.triggerHidden {
  opacity: 0;
  transform: scale(0.92);
  pointer-events: none;
  position: absolute;
  left: 50%;
  translate: -50% 0;
}

.panel {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  margin: 0;
  text-align: left;
  transition:
    max-height 0.45s ease,
    opacity 0.35s ease,
    margin 0.35s ease;
}

.panelOpen {
  max-height: 560px;
  opacity: 1;
  margin: 6px 0 0;
}

.formHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.formTitle {
  font-family: var(--font-serif), Georgia, serif;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    color 0.2s ease,
    border-color 0.2s ease;
}

.close:hover {
  color: var(--text-primary);
  border-color: var(--text-muted);
  transform: rotate(90deg);
}

.form {
  display: flex;
  flex-direction: column;
}

.field {
  display: block;
  margin-bottom: 13px;
}

.label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 5px;
  letter-spacing: 0.03em;
}

.req {
  color: var(--accent);
}

.opt {
  color: var(--text-muted);
  font-style: italic;
}

.input,
.textarea {
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.textarea {
  min-height: 84px;
  resize: vertical;
}

.hint {
  font-size: 11.5px;
  color: var(--text-muted);
  font-style: italic;
  margin: -4px 0 14px;
}

.honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.submit {
  background: var(--accent);
  color: var(--bg-primary);
  font-size: 14px;
  font-weight: 600;
  padding: 11px 22px;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.submit:hover {
  filter: brightness(1.08);
}

.submit:disabled {
  opacity: 0.6;
  cursor: default;
}

.success {
  text-align: center;
  font-size: 14px;
  color: var(--accent);
  padding: 8px 0;
}

.error {
  font-size: 12.5px;
  color: #c97a6d;
  margin: 0 0 12px;
}

@media (prefers-reduced-motion: reduce) {
  .trigger,
  .panel,
  .close {
    transition: none;
  }
}
```

- [ ] **Step 2: Verify lint and existing tests pass**

Run: `npm run lint && npx vitest run src/components/ContactForm.test.tsx`
Expected: lint clean; all ContactForm tests still PASS (CSS classes now resolve to real names).

- [ ] **Step 3: Commit**

```bash
git add src/components/ContactForm.module.css
git commit -m "Adds ContactForm styling and accordion animation"
```

---

## Task 4: Wire the form into the About page

Render `ContactForm` inside the existing `.cta` card, reading the Formspree endpoint from an env var. Keep the social links and divider in place.

**Files:**

- Modify: `src/app/(portfolio)/about/page.tsx`
- Create: `.env.example`

- [ ] **Step 1: Add the env var to `.env.example`**

Create `.env.example`:

```bash
# Formspree endpoint for the About page contact form.
# Public by design — keeps Kenny's real inbox address out of the page source.
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id
```

- [ ] **Step 2: Import ContactForm and render it in the CTA card**

In `src/app/(portfolio)/about/page.tsx`, add the import alongside the existing component imports (near `import SocialLinks from "@/components/SocialLinks";`):

```tsx
import ContactForm from "@/components/ContactForm";
```

Then replace the existing CTA section:

```tsx
<section className={styles.cta}>
  <h2 className={styles.ctaTitle}>Want to work together?</h2>
  <p className={styles.ctaText}>
    I take on select freelance projects that I find interesting and exciting. If
    you have something in mind, I&apos;d love to hear about it.
  </p>
  <SocialLinks links={socialLinks} className={styles.ctaSocials} />
</section>
```

with:

```tsx
<section className={styles.cta}>
  <h2 className={styles.ctaTitle}>Want to work together?</h2>
  <p className={styles.ctaText}>
    I take on select freelance projects that I find interesting and exciting. If
    you have something in mind, I&apos;d love to hear about it.
  </p>
  {process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT && (
    <ContactForm endpoint={process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT} />
  )}
  <div className={styles.ctaDivider}>or find me on</div>
  <SocialLinks links={socialLinks} className={styles.ctaSocials} />
</section>
```

- [ ] **Step 3: Add the divider style to the About page stylesheet**

In `src/app/(portfolio)/about/page.module.css`, append:

```css
.ctaDivider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 24px 0 4px;
}

.ctaDivider::before,
.ctaDivider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
}
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds with no type errors. (The form is omitted at runtime unless `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is set, which is fine for the build.)

- [ ] **Step 5: Commit**

```bash
git add src/app/"(portfolio)"/about/page.tsx src/app/"(portfolio)"/about/page.module.css .env.example
git commit -m "Wires contact form into About page CTA"
```

---

## Task 5: Final verification

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests PASS, including the new `ContactForm.test.tsx`.

- [ ] **Step 2: Lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 3: Manual smoke test (optional but recommended)**

Add a real `NEXT_PUBLIC_FORMSPREE_ENDPOINT` to `.env.local`, run `npm run dev`, open `/about`, and confirm:

- The "Send a message" button shows in the CTA card with social icons below.
- Clicking it animates the form open and fades the button out; the × closes it (and Esc closes it).
- Submitting a valid Name + Message shows "Thanks — I'll be in touch soon." and the message arrives in Formspree.
- Submitting with an empty Name or Message is blocked by the browser.

---

## Self-Review Notes

- **Spec coverage:** Formspree delivery (Tasks 2, 4) · inline accordion A (Tasks 1, 3) · form-header × close + animation (Tasks 1, 3) · Name required / Email optional / Message required (Task 1) · contact hint (Task 1) · inline AJAX + success/error/sending (Task 2) · honeypot (Task 1) · social icons retained (Task 4) · ARIA + Esc + focus management + reduced-motion (Tasks 1, 3) · env-var endpoint (Task 4). All spec sections map to a task.
- **Naming consistency:** `endpoint` prop, `data-testid="contact-panel"` / `"contact-form"`, status union `idle | sending | success | error`, and CSS class names are identical across Tasks 1–4.
