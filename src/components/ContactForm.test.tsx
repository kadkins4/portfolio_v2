import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("moves focus to the success message after a successful submit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    render(<ContactForm endpoint={ENDPOINT} />);
    openAndFill();
    fireEvent.submit(screen.getByTestId("contact-form"));

    await waitFor(() =>
      expect(screen.getByText(/Thanks — I'll be in touch soon\./)).toHaveFocus()
    );
  });
});
