import { describe, it, expect } from "vitest";
import { sortStudioItems } from "./sortStudioItems";
import type { StudioItem } from "@/types";

function item(partial: Partial<StudioItem> & { slug: string }): StudioItem {
  return {
    kind: "project",
    href: `/projects/${partial.slug}`,
    title: partial.slug,
    description: "",
    tags: [],
    date: null,
    image: null,
    imageFocus: "center",
    externalUrl: null,
    featured: false,
    order: null,
    ...partial,
  };
}

describe("sortStudioItems", () => {
  it("pins featured items above non-featured, regardless of date", () => {
    const featuredOld = item({
      slug: "featured-old",
      featured: true,
      order: 1,
      date: "2019-01-01",
    });
    const recent = item({ slug: "recent", date: "2025-01-01" });

    const sorted = sortStudioItems([recent, featuredOld]);

    expect(sorted.map((i) => i.slug)).toEqual(["featured-old", "recent"]);
  });

  it("orders featured items by `order` ascending", () => {
    const second = item({ slug: "second", featured: true, order: 2 });
    const first = item({ slug: "first", featured: true, order: 1 });

    const sorted = sortStudioItems([second, first]);

    expect(sorted.map((i) => i.slug)).toEqual(["first", "second"]);
  });

  it("does NOT let a non-featured item's `order` float it above featured items", () => {
    // Mirrors real content: arbutus is order:0 but not featured.
    const arbutus = item({
      slug: "arbutus",
      featured: false,
      order: 0,
      date: "2020-09-01",
    });
    const featured = item({
      slug: "the-score-bet",
      featured: true,
      order: 1,
      date: "2022-03-28",
    });

    const sorted = sortStudioItems([arbutus, featured]);

    expect(sorted.map((i) => i.slug)).toEqual(["the-score-bet", "arbutus"]);
  });

  it("sorts non-featured items by date descending, undated last", () => {
    const undated = item({ slug: "undated", date: null });
    const older = item({ slug: "older", date: "2020-01-01" });
    const newer = item({ slug: "newer", date: "2024-01-01" });

    const sorted = sortStudioItems([undated, older, newer]);

    expect(sorted.map((i) => i.slug)).toEqual(["newer", "older", "undated"]);
  });

  it("matches the full expected studio ordering", () => {
    const scoreBet = item({
      slug: "the-score-bet",
      featured: true,
      order: 1,
      date: "2022-03-28",
    });
    const scoreMedia = item({
      slug: "the-score-media",
      featured: true,
      order: 2,
      date: "2022-03-28",
    });
    const arbutus = item({
      slug: "arbutus",
      featured: false,
      order: 0,
      date: "2020-09-01",
    });
    const note = item({
      slug: "referral-codes",
      kind: "note",
      date: "2025-05-01",
    });
    const saul = item({ slug: "saul", date: null });

    const sorted = sortStudioItems([arbutus, saul, scoreMedia, note, scoreBet]);

    expect(sorted.map((i) => i.slug)).toEqual([
      "the-score-bet", // featured, order 1
      "the-score-media", // featured, order 2
      "referral-codes", // newest dated non-featured
      "arbutus", // older dated non-featured
      "saul", // undated, last
    ]);
  });

  it("does not mutate the input array", () => {
    const a = item({ slug: "a", date: "2020-01-01" });
    const b = item({ slug: "b", featured: true, order: 1 });
    const input = [a, b];

    sortStudioItems(input);

    expect(input).toEqual([a, b]);
  });
});
