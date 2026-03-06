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

describe("NotFound", () => {
  it("renders 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
  });

  it("displays a message", () => {
    render(<NotFound />);
    // Message should be one of the randomized options
    const message = screen.getByText(
      /page|coffee|framework|refactoring|undefined/i
    );
    expect(message).toBeInTheDocument();
  });

  it("has navigation links", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: /projects/i })).toHaveAttribute(
      "href",
      "/projects"
    );
  });
});
