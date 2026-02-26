import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
});
