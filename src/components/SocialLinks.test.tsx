import { render, screen } from "@testing-library/react";
import SocialLinks from "./SocialLinks";

const links = [
  {
    platform: "github" as const,
    url: "https://github.com/test",
    showInFooter: true,
  },
  {
    platform: "instagram" as const,
    url: "https://instagram.com/test",
    showInFooter: true,
  },
  {
    platform: "linkedin" as const,
    url: "https://linkedin.com/in/test",
    showInFooter: true,
  },
];

describe("SocialLinks", () => {
  it("renders one link per entry", () => {
    render(<SocialLinks links={links} />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("renders links with correct href", () => {
    render(<SocialLinks links={links} />);
    expect(screen.getByLabelText("GitHub")).toHaveAttribute(
      "href",
      "https://github.com/test"
    );
    expect(screen.getByLabelText("Instagram")).toHaveAttribute(
      "href",
      "https://instagram.com/test"
    );
    expect(screen.getByLabelText("LinkedIn")).toHaveAttribute(
      "href",
      "https://linkedin.com/in/test"
    );
  });

  it("opens all links in a new tab with noopener noreferrer", () => {
    render(<SocialLinks links={links} />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("renders a nav element with accessible label", () => {
    render(<SocialLinks links={links} />);
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      "Social links"
    );
  });

  it("applies custom className when provided", () => {
    render(<SocialLinks links={links} className="custom-class" />);
    expect(screen.getByRole("navigation")).toHaveClass("custom-class");
  });
});
