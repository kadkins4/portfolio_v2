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
