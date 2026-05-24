import { describe, it, expect } from "vitest";
import { parseNote, isPublished } from "./frontmatter";

const PUBLISHED = `---
title: My First Note
summary: A short note
tags: [AI, Tools]
date: 2026-05-01
publish: true
---
Body text here.

Second paragraph.`;

const PRIVATE = `---
title: Secret
publish: false
---
nope`;

const NO_FRONTMATTER = `Just a body, no frontmatter.`;

describe("isPublished", () => {
  it("is true only when publish: true", () => {
    expect(isPublished(PUBLISHED)).toBe(true);
    expect(isPublished(PRIVATE)).toBe(false);
    expect(isPublished(NO_FRONTMATTER)).toBe(false);
  });
});

describe("parseNote", () => {
  it("maps frontmatter to note fields", () => {
    const note = parseNote(PUBLISHED, "Learning/My First Note.md", 0);
    expect(note.title).toBe("My First Note");
    expect(note.slug).toBe("my-first-note");
    expect(note.summary).toBe("A short note");
    expect(note.tags).toEqual(["AI", "Tools"]);
    expect(note.date).toBe("2026-05-01");
    expect(note.sourcePath).toBe("Learning/My First Note.md");
    expect(note.body.startsWith("Body text here.")).toBe(true);
  });

  it("falls back to filename for title and first paragraph for summary", () => {
    const md = `---\npublish: true\n---\nFirst para becomes summary.\n\nSecond.`;
    const note = parseNote(md, "Inbox/quick-thought.md", 1700000000000);
    expect(note.title).toBe("quick-thought");
    expect(note.summary).toBe("First para becomes summary.");
    expect(note.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
