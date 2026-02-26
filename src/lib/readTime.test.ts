import { describe, it, expect } from "vitest";
import { readTime } from "./readTime";

describe("readTime", () => {
  it("returns 1 min for short text", () => {
    expect(readTime("hello world")).toBe("1 min read");
  });

  it("returns correct minutes for longer text", () => {
    const words = Array(400).fill("word").join(" ");
    expect(readTime(words)).toBe("2 min read");
  });

  it("returns 1 min for empty string", () => {
    expect(readTime("")).toBe("1 min read");
  });

  it("returns 1 min for whitespace-only string", () => {
    expect(readTime("   ")).toBe("1 min read");
  });

  it("rounds correctly at boundary", () => {
    const words = Array(300).fill("word").join(" ");
    expect(readTime(words)).toBe("2 min read"); // 300/200 = 1.5 → rounds to 2
  });
});
