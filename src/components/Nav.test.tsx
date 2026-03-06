import { render, screen, within, fireEvent } from "@testing-library/react";
import Nav from "./Nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

describe("Nav", () => {
  it("hides nav links when routes are disabled", () => {
    render(
      <Nav enabledRoutes={{ blog: false, projects: true, contact: false }} />
    );

    const mainNav = screen.getByRole("navigation", { name: "Main navigation" });

    expect(
      within(mainNav).queryByRole("link", { name: "blog" })
    ).not.toBeInTheDocument();
    expect(
      within(mainNav).queryByRole("link", { name: "contact" })
    ).not.toBeInTheDocument();
    expect(
      within(mainNav).getByRole("link", { name: "projects" })
    ).toBeInTheDocument();
    expect(
      within(mainNav).getByRole("link", { name: "home" })
    ).toBeInTheDocument();
    expect(
      within(mainNav).getByRole("link", { name: "about" })
    ).toBeInTheDocument();
  });

  it("shows all nav links when enabledRoutes is undefined", () => {
    render(<Nav />);

    const mainNav = screen.getByRole("navigation", { name: "Main navigation" });

    expect(
      within(mainNav).getByRole("link", { name: "blog" })
    ).toBeInTheDocument();
    expect(
      within(mainNav).getByRole("link", { name: "projects" })
    ).toBeInTheDocument();
    expect(
      within(mainNav).getByRole("link", { name: "contact" })
    ).toBeInTheDocument();
  });

  it("closes mobile menu when a mobile nav link is clicked", () => {
    render(<Nav />);

    // Open the mobile menu
    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" })
    );
    expect(
      screen.getByRole("button", { name: "Close navigation menu" })
    ).toBeInTheDocument();

    // Click a link in the mobile nav
    const mobileNav = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    fireEvent.click(within(mobileNav).getByRole("link", { name: "about" }));

    // Menu should now be closed
    expect(
      screen.getByRole("button", { name: "Open navigation menu" })
    ).toBeInTheDocument();
  });
});
