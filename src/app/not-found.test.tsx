import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/holo/HoloFrame", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("NotFound", () => {
  it("renders 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
  });

  it("displays a message starting with Page not found", () => {
    render(<NotFound />);
    const message = screen.getByText(/^Page not found\./i);
    expect(message).toBeInTheDocument();
  });

  it("has a link back home", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
