import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("strips punctuation and collapses separators", () => {
    expect(slugify("CSS :has() is great!")).toBe("css-has-is-great");
  });
  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Edge case--  ")).toBe("edge-case");
  });
});
