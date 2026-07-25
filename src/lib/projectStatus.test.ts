import { describe, expect, it } from "vitest";
import { isListed, statusOf } from "./projectStatus";

describe("statusOf", () => {
  it("reads an explicit in-progress status", () => {
    expect(statusOf({ status: "in-progress" })).toBe("in-progress");
  });

  it("treats a missing status as live (pre-field entries)", () => {
    expect(statusOf({})).toBe("live");
    expect(statusOf({ status: null })).toBe("live");
    expect(statusOf({ status: undefined })).toBe("live");
  });

  it("treats any unknown value as live", () => {
    expect(statusOf({ status: "archived" })).toBe("live");
  });
});

describe("isListed", () => {
  it("lists live projects", () => {
    expect(isListed({ status: "live" })).toBe(true);
    expect(isListed({})).toBe(true);
  });

  it("hides in-progress projects from listings", () => {
    expect(isListed({ status: "in-progress" })).toBe(false);
  });

  it("keeps a mixed set filtering to only the live ones", () => {
    const entries = [
      { slug: "a", status: "live" },
      { slug: "b", status: "in-progress" },
      { slug: "c" },
    ];
    expect(entries.filter(isListed).map((e) => e.slug)).toEqual(["a", "c"]);
  });
});
