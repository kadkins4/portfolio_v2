import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StudioGrid from "./StudioGrid";
import type { StudioItem } from "@/types";

const items: StudioItem[] = [
  {
    kind: "project",
    slug: "proj",
    href: "/projects/proj",
    title: "A Project",
    description: "desc",
    tags: ["Work"],
    date: "2026-05-02",
    image: null,
    imageFocus: "center",
    externalUrl: null,
  },
  {
    kind: "note",
    slug: "note",
    href: "/notes/note",
    title: "A Note",
    description: "summary",
    tags: ["AI"],
    date: "2026-05-01",
    image: null,
    imageFocus: "center",
    externalUrl: null,
  },
];

describe("StudioGrid", () => {
  it("renders both projects and notes by default", () => {
    render(<StudioGrid items={items} />);
    expect(
      screen.getByRole("heading", { name: "A Project" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A Note" })).toBeInTheDocument();
  });

  it("offers Projects, Notes, and topic-tag filters", () => {
    render(<StudioGrid items={items} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Projects" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Work" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI" })).toBeInTheDocument();
  });
});
