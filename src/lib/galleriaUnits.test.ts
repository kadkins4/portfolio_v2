import { describe, expect, it } from "vitest";
import { buildGalleriaUnits, SLOTS, type CityProject } from "./galleriaUnits";

function project(
  slug: string,
  status: CityProject["status"] = "live"
): CityProject {
  return {
    slug,
    title: slug,
    description: `${slug} desc`,
    cityBlurb: null,
    status,
    hue: 190,
    districtLabel: "Tools",
  };
}

const nine = Array.from({ length: 9 }, (_, i) => project(`p${i}`));

describe("buildGalleriaUnits", () => {
  it("always renders exactly 14 slots", () => {
    expect(buildGalleriaUnits([]).length).toBe(SLOTS.length);
    expect(buildGalleriaUnits(nine).length).toBe(14);
  });

  it("fills one unit per project and leases out the rest", () => {
    const units = buildGalleriaUnits(nine);
    expect(units.filter((u) => u.state !== "vacant")).toHaveLength(9);
    expect(units.filter((u) => u.state === "vacant")).toHaveLength(5);
  });

  it("gives the first two projects the anchor slots", () => {
    const units = buildGalleriaUnits(nine);
    const anchors = units.filter((u) => u.anchor);
    expect(anchors).toHaveLength(2);
    expect(anchors.map((u) => u.slug)).toEqual(["p0", "p1"]);
  });

  it("routes every occupied unit to its project detail page", () => {
    for (const u of buildGalleriaUnits(nine).filter((x) => x.slug)) {
      expect(u.href).toBe(`/projects/${u.slug}`);
      expect(u.pad).toBeDefined();
      expect(u.name).toBe(u.slug);
      expect(u.teaser?.title).toBe(`${u.slug}.`);
    }
  });

  it("gives vacant units no pad and no route", () => {
    for (const u of buildGalleriaUnits(nine).filter(
      (x) => x.state === "vacant"
    )) {
      expect(u.pad).toBeUndefined();
      expect(u.href).toBeUndefined();
    }
  });

  it("consumes a lease slot when a tenth project publishes — no code change", () => {
    const ten = [...nine, project("p9")];
    const units = buildGalleriaUnits(ten);
    expect(units.filter((u) => u.state !== "vacant")).toHaveLength(10);
    expect(units.filter((u) => u.state === "vacant")).toHaveLength(4);
  });

  it("marks in-progress tenants as construction, still routed", () => {
    const units = buildGalleriaUnits([project("wip", "in-progress")]);
    const wip = units.find((u) => u.slug === "wip")!;
    expect(wip.state).toBe("in-progress");
    expect(wip.href).toBe("/projects/wip");
    expect(wip.teaser?.cta).toMatch(/build/i);
  });
});
