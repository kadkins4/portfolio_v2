import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

import NeonCity from "./NeonCity";

/**
 * These cover the two code paths that read a client-only value and push it into
 * state — the reduced-motion intro skip and the ?dev=1 collider overlay. Both
 * are about to be refactored, and neither had any coverage.
 *
 * Assertions are on observable DOM, and deliberately use waitFor rather than
 * checking synchronously after mount: whether the value lands during the mount
 * effect or on the first animation frame is an implementation detail that the
 * refactor is allowed to change.
 */

function mockMedia({ reduced = false, coarse = false } = {}) {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("reduced-motion") ? reduced : coarse,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

function visit(search = "") {
  window.history.replaceState({}, "", `/city${search}`);
}

beforeEach(() => {
  localStorage.clear();
  visit();
  mockMedia();
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("NeonCity", () => {
  it("mounts the stage as the page's main landmark", () => {
    render(<NeonCity name="Kendall Adkins" />);
    expect(
      screen.getByRole("main", { name: /neon city/i })
    ).toBeInTheDocument();
  });

  it("plays the intro cinematic when motion is allowed", () => {
    const { container } = render(<NeonCity name="Kendall Adkins" />);
    // introFreeze is applied while introPhase !== "done"
    expect(
      container.querySelector('[class*="introFreeze"]')
    ).toBeInTheDocument();
  });

  it("skips the intro cinematic under reduced motion", async () => {
    mockMedia({ reduced: true });
    const { container } = render(<NeonCity name="Kendall Adkins" />);
    await waitFor(() =>
      expect(
        container.querySelector('[class*="introFreeze"]')
      ).not.toBeInTheDocument()
    );
  });
});

describe("NeonCity – dev flags", () => {
  it("hides the dev panel without ?dev=1", () => {
    render(<NeonCity name="Kendall Adkins" />);
    expect(screen.queryByText(/DEV · COLLIDERS/)).not.toBeInTheDocument();
  });

  it("shows the dev panel with ?dev=1", async () => {
    visit("?dev=1");
    render(<NeonCity name="Kendall Adkins" />);
    await waitFor(() =>
      expect(screen.getByText(/DEV · COLLIDERS/)).toBeInTheDocument()
    );
  });

  it("restores the collider overlay from localStorage under ?dev=1", async () => {
    visit("?dev=1");
    localStorage.setItem("neoncity.colliders", "1");
    const { container } = render(<NeonCity name="Kendall Adkins" />);
    await waitFor(() =>
      expect(container.querySelector("#nc-collision-debug")).toBeInTheDocument()
    );
  });

  it("leaves the collider overlay off when localStorage has not opted in", async () => {
    visit("?dev=1");
    const { container } = render(<NeonCity name="Kendall Adkins" />);
    await waitFor(() =>
      expect(screen.getByText(/DEV · COLLIDERS/)).toBeInTheDocument()
    );
    expect(
      container.querySelector("#nc-collision-debug")
    ).not.toBeInTheDocument();
  });

  // Regression: the snapshot is read during render, and a browser with storage
  // blocked throws on the *read*. Unguarded that took the whole page down.
  it("still renders when the browser blocks storage access", async () => {
    visit("?dev=1");
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new DOMException("The operation is insecure.", "SecurityError");
      });
    try {
      render(<NeonCity name="Kendall Adkins" />);
      await waitFor(() =>
        expect(screen.getByText(/DEV · COLLIDERS/)).toBeInTheDocument()
      );
    } finally {
      getItem.mockRestore();
    }
  });

  it("ignores the stored collider flag when ?dev=1 is absent", async () => {
    localStorage.setItem("neoncity.colliders", "1");
    const { container } = render(<NeonCity name="Kendall Adkins" />);
    await waitFor(() =>
      expect(screen.queryByText(/DEV · COLLIDERS/)).not.toBeInTheDocument()
    );
    expect(
      container.querySelector("#nc-collision-debug")
    ).not.toBeInTheDocument();
  });
});
