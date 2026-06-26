import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TypedReveal, { type TypedStep } from "./TypedReveal";

// jsdom lacks matchMedia; default to "reduced motion" so content renders
// immediately and synchronously (no fake timers needed for these assertions).
function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

const steps: TypedStep[] = [
  { kind: "command", text: "cat resume.md" },
  { kind: "line", text: "all systems nominal", tone: "error" },
  { kind: "reveal", node: <p data-rise>revealed body</p> },
];

describe("TypedReveal", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("with reduced motion, shows the head and all step content immediately", () => {
    mockMatchMedia(true);
    render(
      <TypedReveal name="Kendall Adkins" head={<h1>Resume</h1>} steps={steps} />
    );
    expect(screen.getByRole("heading", { name: "Resume" })).toBeInTheDocument();
    expect(screen.getByText("cat resume.md")).toBeInTheDocument();
    expect(screen.getByText("all systems nominal")).toBeInTheDocument();
    expect(screen.getByText("revealed body")).toBeInTheDocument();
  });

  it("renders the command prompt for command steps", () => {
    mockMatchMedia(true);
    render(<TypedReveal name="Kendall Adkins" steps={steps} />);
    expect(screen.getByText("kendall@adkins:~$")).toBeInTheDocument();
  });
});
