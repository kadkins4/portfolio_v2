import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NoteCard from "./NoteCard";

describe("NoteCard", () => {
  it("links to the note detail page and shows title, summary, tag", () => {
    render(
      <NoteCard
        slug="my-note"
        title="My Note"
        summary="A short summary."
        tags={["AI"]}
        date="2026-05-01"
        image={null}
      />
    );
    expect(
      screen.getByRole("heading", { name: "My Note" })
    ).toBeInTheDocument();
    expect(screen.getByText("A short summary.")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/notes/my-note");
  });
});
