import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsTouch } from "./useIsTouch";

function mockPointer(coarse: boolean, touchPoints = coarse ? 5 : 0) {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: coarse && q.includes("coarse"),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  Object.defineProperty(navigator, "maxTouchPoints", {
    value: touchPoints,
    configurable: true,
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("useIsTouch", () => {
  it("returns true on a coarse-pointer device", () => {
    mockPointer(true);
    const { result } = renderHook(() => useIsTouch());
    expect(result.current).toBe(true);
  });

  it("returns false on a fine-pointer device", () => {
    mockPointer(false);
    const { result } = renderHook(() => useIsTouch());
    expect(result.current).toBe(false);
  });
});
