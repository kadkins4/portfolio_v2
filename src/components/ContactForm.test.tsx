import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactForm from "./ContactForm";

const ENDPOINT = "https://formspree.io/f/test123";

describe("ContactForm — fields", () => {
  it("renders the compose form inline (no toggle)", () => {
    render(<ContactForm endpoint={ENDPOINT} />);
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    expect(screen.getByLabelText("NAME")).toBeInTheDocument();
    expect(screen.getByLabelText("MESSAGE")).toBeInTheDocument();
    expect(screen.getByLabelText("EMAIL / HANDLE")).toBeInTheDocument();
  });

  it("includes a hidden honeypot field", () => {
    const { container } = render(<ContactForm endpoint={ENDPOINT} />);
    const honeypot = container.querySelector('input[name="_gotcha"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
  });
});

describe("ContactForm — validation", () => {
  it("blocks submit and shows the required hint when name/message are empty", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<ContactForm endpoint={ENDPOINT} />);
    fireEvent.submit(screen.getByTestId("contact-form"));

    expect(screen.getByText(/name \+ message required/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe("ContactForm — submission", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function fill() {
    fireEvent.change(screen.getByLabelText("NAME"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText("MESSAGE"), {
      target: { value: "Hello there" },
    });
  }

  it("POSTs to the Formspree endpoint and shows the terminal receipt", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<ContactForm endpoint={ENDPOINT} />);
    fill();
    fireEvent.submit(screen.getByTestId("contact-form"));

    await waitFor(() =>
      expect(screen.getByText(/MESSAGE SENT/)).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({
        method: "POST",
        headers: { Accept: "application/json" },
      })
    );
    // form is replaced by the receipt
    expect(screen.queryByTestId("contact-form")).not.toBeInTheDocument();
    // receipt echoes the sender name
    expect(screen.getByText(/from: Jane/)).toBeInTheDocument();
  });

  it("can reset back to the form via 'send another'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    render(<ContactForm endpoint={ENDPOINT} />);
    fill();
    fireEvent.submit(screen.getByTestId("contact-form"));

    await waitFor(() =>
      expect(screen.getByText(/MESSAGE SENT/)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /send another/ }));
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });

  it("shows an error and keeps the form when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    render(<ContactForm endpoint={ENDPOINT} />);
    fill();
    fireEvent.submit(screen.getByTestId("contact-form"));

    await waitFor(() =>
      expect(screen.getByText(/send failed/)).toBeInTheDocument()
    );
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });

  it("disables the submit button while the request is in flight", async () => {
    let resolve: (v: { ok: boolean }) => void = () => {};
    const pending = new Promise<{ ok: boolean }>((r) => (resolve = r));
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));

    render(<ContactForm endpoint={ENDPOINT} />);
    fill();
    fireEvent.submit(screen.getByTestId("contact-form"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /sending/ })).toBeDisabled()
    );
    resolve({ ok: true });
  });

  it("moves focus to the receipt after a successful submit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    render(<ContactForm endpoint={ENDPOINT} />);
    fill();
    fireEvent.submit(screen.getByTestId("contact-form"));

    await waitFor(() =>
      expect(
        screen.getByText(/MESSAGE SENT/).closest("[role='status']")
      ).toHaveFocus()
    );
  });
});
