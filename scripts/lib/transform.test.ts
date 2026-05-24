import { describe, it, expect } from "vitest";
import {
  transformWikilinks,
  transformCallouts,
  stripComments,
  transformEmbeds,
} from "./transform";

describe("transformWikilinks", () => {
  const published = new Map([["other note", "other-note"]]);

  it("links to published targets, with alias support", () => {
    expect(transformWikilinks("see [[Other Note]]", published)).toBe(
      "see [Other Note](/notes/other-note)"
    );
    expect(transformWikilinks("see [[Other Note|that]]", published)).toBe(
      "see [that](/notes/other-note)"
    );
  });

  it("renders unpublished targets as plain text", () => {
    expect(transformWikilinks("see [[Private Note]]", published)).toBe(
      "see Private Note"
    );
    expect(transformWikilinks("see [[Private|x]]", published)).toBe("see x");
  });

  it("does not touch image embeds", () => {
    expect(transformWikilinks("![[image.png]]", published)).toBe(
      "![[image.png]]"
    );
  });
});

describe("transformCallouts", () => {
  it("converts a callout header to a bold blockquote line", () => {
    const input = "> [!note] Heads up\n> body line";
    expect(transformCallouts(input)).toBe("> **Heads up**\n> body line");
  });
  it("uses the type as the title when none is given", () => {
    expect(transformCallouts("> [!warning]\n> careful")).toBe(
      "> **Warning**\n> careful"
    );
  });
});

describe("stripComments", () => {
  it("removes %% comments %%", () => {
    expect(stripComments("a %%secret%% b")).toBe("a  b");
    expect(stripComments("a %%multi\nline%% b")).toBe("a  b");
  });
});

describe("transformEmbeds", () => {
  it("rewrites image embeds and records the copy, ignoring missing assets", () => {
    const copied: Array<{ from: string; to: string }> = [];
    const resolveAsset = (name: string) =>
      name === "diagram.png" ? "/vault/attachments/diagram.png" : null;

    const out = transformEmbeds(
      "intro\n![[diagram.png]]\n![[missing.png]]\nend",
      "my-note",
      resolveAsset,
      (from, to) => copied.push({ from, to })
    );

    expect(out).toContain("![diagram](/images/notes/my-note/diagram.png)");
    expect(out).not.toContain("missing.png");
    expect(copied).toEqual([
      { from: "/vault/attachments/diagram.png", to: "my-note/diagram.png" },
    ]);
  });

  it("leaves note transclusions out (warns, drops)", () => {
    const out = transformEmbeds(
      "![[Some Note]]",
      "n",
      () => null,
      () => {}
    );
    expect(out.trim()).toBe("");
  });
});
