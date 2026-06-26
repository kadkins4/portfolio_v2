import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("TypedReveal – animated path (matches:false)", () => {
  const animSteps: TypedStep[] = [
    { kind: "command", text: "cat x.md" },
    { kind: "reveal", node: <p data-rise>body</p> },
  ];

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("types incrementally then reveals after timers advance", () => {
    mockMatchMedia(false); // motion ENABLED – animated path
    vi.useFakeTimers();

    const { container } = render(
      <TypedReveal name="Kendall Adkins" steps={animSteps} />
    );

    // Immediately after mount: typing in progress — full command not yet present,
    // cursor element is shown (component renders showCursor=true while active).
    expect(screen.queryByText("cat x.md")).not.toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

    // First advance: finishes all typing timers and fires setCurrent(1).
    // act() flushes the resulting re-render + effects, which schedules the
    // reveal step's setTimeout(0).
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    // Second advance: fires the reveal step's setTimeout(0) → setCurrent(2).
    // act() flushes that re-render + RevealBlock's useEffect (sets animationDelay).
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Full command text rendered
    expect(screen.getByText("cat x.md")).toBeInTheDocument();
    // Reveal body present
    expect(screen.getByText("body")).toBeInTheDocument();
    // RevealBlock gained active class
    expect(
      container.querySelector('[class*="revealActive"]')
    ).toBeInTheDocument();
    // RevealBlock useEffect set animationDelay on the [data-rise] element
    const riseEl = container.querySelector("[data-rise]") as HTMLElement;
    expect(riseEl).toBeInTheDocument();
    expect(riseEl.style.animationDelay).toBe("0ms");
  });
});
