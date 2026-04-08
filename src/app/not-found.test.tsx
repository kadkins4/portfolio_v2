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

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}));

vi.mock("@/components/Header", () => ({
  default: () => <header data-testid="header" />,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <footer data-testid="footer" />,
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

  it("has Back to Home link", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("renders header and footer", () => {
    render(<NotFound />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
