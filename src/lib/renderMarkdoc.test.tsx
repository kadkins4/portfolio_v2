import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderMarkdoc } from "./renderMarkdoc";

describe("renderMarkdoc video tag", () => {
  it("renders a <video> with controls for {% video %} tags", () => {
    const result = {
      node: {
        type: "document",
        children: [
          {
            type: "tag",
            tag: "video",
            attributes: { src: "/videos/projects/demo.mp4" },
            children: [],
          },
        ],
      },
    };
    const html = renderToStaticMarkup(<>{renderMarkdoc(result)}</>);
    expect(html).toContain("<video");
    expect(html).toContain('src="/videos/projects/demo.mp4"');
    expect(html).toContain("controls");
  });

  it("still falls through for unknown tags", () => {
    const result = {
      node: {
        type: "document",
        children: [
          { type: "tag", tag: "mystery", attributes: {}, children: [] },
        ],
      },
    };
    const html = renderToStaticMarkup(<>{renderMarkdoc(result)}</>);
    expect(html).not.toContain("<video");
  });
});

describe("renderMarkdoc image node", () => {
  it("renders an <img> with src and alt", () => {
    const result = {
      node: {
        type: "document",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "image",
                attributes: { src: "/images/notes/n/d.png", alt: "d" },
              },
            ],
          },
        ],
      },
    };
    const html = renderToStaticMarkup(<>{renderMarkdoc(result)}</>);
    expect(html).toContain('src="/images/notes/n/d.png"');
    expect(html).toContain('alt="d"');
    expect(html).toContain('loading="lazy"');
  });
});
