import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import ProjectStorefront from "./ProjectStorefront";
import { DISTRICTS } from "@/lib/district";

vi.mock("./PageShell", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("./ContactDispatch", () => ({ default: () => null }));
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  ),
}));

function renderStorefront(overrides: { video?: string | null } = {}) {
  return render(
    <ProjectStorefront
      slug="hush"
      title="Hush"
      district={DISTRICTS.tools}
      year="2026"
      live={null}
      image="/images/projects/hush/image.png"
      tags={[]}
      next={null}
      video={overrides.video ?? null}
    >
      <p>writeup</p>
    </ProjectStorefront>
  );
}

describe("ProjectStorefront hero video", () => {
  it("renders a looping muted autoplay video with the image as poster", () => {
    renderStorefront({ video: "/videos/projects/hush.mp4" });

    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    expect(video!.getAttribute("src")).toBe("/videos/projects/hush.mp4");
    expect(video!.getAttribute("poster")).toBe(
      "/images/projects/hush/image.png"
    );
    expect(video!.hasAttribute("loop")).toBe(true);
    expect(video!.hasAttribute("autoplay")).toBe(true);
    expect(video!.hasAttribute("playsinline")).toBe(true);
    expect(video!.muted).toBe(true);
    // image is the poster, not a second hero element
    expect(screen.queryByAltText("Hush — hero")).toBeNull();
  });

  it("renders the hero image when no video is set", () => {
    renderStorefront();

    expect(document.querySelector("video")).toBeNull();
    expect(screen.getByAltText("Hush — hero")).toBeInTheDocument();
  });

  it("hides the enlarge button when a video is present", () => {
    renderStorefront({ video: "/videos/projects/hush.mp4" });
    expect(screen.queryByRole("button", { name: /enlarge/i })).toBeNull();
  });

  it("keeps the enlarge button for image-only heroes", () => {
    renderStorefront();
    expect(
      screen.getByRole("button", { name: /enlarge/i })
    ).toBeInTheDocument();
  });
});
