import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactForm from "./ContactForm";

describe("ContactForm", () => {
  it("shows spinner while submitting", async () => {
    // Mock fetch to delay response
    global.fetch = vi.fn(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(() => resolve({ ok: true } as Response), 100)
        )
    );

    render(<ContactForm />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "Hello" },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    // Spinner should appear
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });
  });
});
