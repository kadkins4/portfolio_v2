import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderMarkdoc } from "./renderMarkdoc";

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
