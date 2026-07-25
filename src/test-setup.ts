import "@testing-library/jest-dom";

// jsdom models SVG minimally: `document.createElementNS(svgNS, "path")` returns
// a bare SVGElement, there is no SVGPathElement, and none of the geometry
// methods exist. NeonCity samples an off-screen path to drive the train along
// the rail, so without these it throws on mount and the component cannot be
// rendered in a test at all. This is the reason the file went untested.
//
// The stub is deliberately simple — a straight vertical line down x=680, which
// is roughly where the real rail meets the platform. Tests should not assert on
// train position through it; it exists so the component can mount.
const svgProto = globalThis.SVGElement?.prototype as unknown as Record<
  string,
  unknown
>;
if (svgProto && typeof svgProto.getTotalLength !== "function") {
  svgProto.getTotalLength = () => 1000;
  svgProto.getPointAtLength = (s: number) => ({ x: 680, y: 700 - s });
}
