import { render, screen } from "@testing-library/react";
import SocialLinks from "./SocialLinks";

const links = [
  { platform: "github" as const, url: "https://github.com/test", showInFooter: true, showInContact: true },
  { platform: "email" as const, url: "test@example.com", showInFooter: true, showInContact: true },
];

describe("SocialLinks", () => {
  it("renders one link per entry", () => {
    render(<SocialLinks links={links} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("uses mailto: prefix for email platform", () => {
    render(<SocialLinks links={links} />);
    const emailLink = screen.getByLabelText("Email");
    expect(emailLink).toHaveAttribute("href", "mailto:test@example.com");
  });

  it("renders non-email links with url as-is", () => {
    render(<SocialLinks links={links} />);
    const githubLink = screen.getByLabelText("GitHub");
    expect(githubLink).toHaveAttribute("href", "https://github.com/test");
  });

  it("opens non-email links in a new tab with noopener noreferrer", () => {
    render(<SocialLinks links={links} />);
    const githubLink = screen.getByLabelText("GitHub");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not set target or rel on email links", () => {
    render(<SocialLinks links={links} />);
    const emailLink = screen.getByLabelText("Email");
    expect(emailLink).not.toHaveAttribute("target");
    expect(emailLink).not.toHaveAttribute("rel");
  });
});
