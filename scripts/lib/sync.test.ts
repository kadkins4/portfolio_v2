import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runSync } from "./sync-core";

let vault: string;
let repo: string;

beforeEach(() => {
  vault = fs.mkdtempSync(path.join(os.tmpdir(), "vault-"));
  repo = fs.mkdtempSync(path.join(os.tmpdir(), "repo-"));
  fs.mkdirSync(path.join(repo, "content"), { recursive: true });
  fs.mkdirSync(path.join(repo, "public/images"), { recursive: true });
});
afterEach(() => {
  fs.rmSync(vault, { recursive: true, force: true });
  fs.rmSync(repo, { recursive: true, force: true });
});

function write(rel: string, body: string) {
  const p = path.join(vault, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
}

describe("runSync", () => {
  it("publishes only publish:true notes and excludes private ones", () => {
    write(
      "Learning/Public.md",
      `---\ntitle: Public Note\ntags: [AI]\ndate: 2026-05-01\npublish: true\n---\nHello world.`
    );
    write("Finance/Secret.md", `---\ntitle: Secret\n---\nprivate stuff`);

    const result = runSync({ vaultDir: vault, repoDir: repo, dryRun: false });

    expect(result.published.map((n) => n.slug)).toEqual(["public-note"]);
    const file = path.join(repo, "content/notes/public-note.mdoc");
    expect(fs.existsSync(file)).toBe(true);
    const out = fs.readFileSync(file, "utf8");
    expect(out).toContain('title: "Public Note"');
    expect(out).toContain("Hello world.");
    expect(fs.existsSync(path.join(repo, "content/notes/secret.mdoc"))).toBe(
      false
    );
  });

  it("is idempotent and clears removed notes", () => {
    write("a.md", `---\ntitle: A\npublish: true\n---\nbody A`);
    runSync({ vaultDir: vault, repoDir: repo, dryRun: false });
    write("a.md", `---\ntitle: A\npublish: false\n---\nbody A`);
    runSync({ vaultDir: vault, repoDir: repo, dryRun: false });
    expect(fs.existsSync(path.join(repo, "content/notes/a.mdoc"))).toBe(false);
  });

  it("dry-run writes nothing", () => {
    write("a.md", `---\ntitle: A\npublish: true\n---\nbody`);
    const result = runSync({ vaultDir: vault, repoDir: repo, dryRun: true });
    expect(result.published).toHaveLength(1);
    expect(fs.existsSync(path.join(repo, "content/notes/a.mdoc"))).toBe(false);
  });

  it("quotes titles so colons stay valid YAML", () => {
    write("r.md", `---\ntitle: "React: A Deep Dive"\npublish: true\n---\nbody`);
    runSync({ vaultDir: vault, repoDir: repo, dryRun: false });
    const out = fs.readFileSync(
      path.join(repo, "content/notes/react-a-deep-dive.mdoc"),
      "utf8"
    );
    expect(out).toContain('title: "React: A Deep Dive"');
  });

  it("de-duplicates colliding slugs instead of overwriting", () => {
    write("one.md", `---\ntitle: "My Note!"\npublish: true\n---\nfirst`);
    write("two.md", `---\ntitle: "My Note"\npublish: true\n---\nsecond`);
    const result = runSync({ vaultDir: vault, repoDir: repo, dryRun: false });
    expect(result.published.map((n) => n.slug).sort()).toEqual([
      "my-note",
      "my-note-2",
    ]);
    expect(fs.existsSync(path.join(repo, "content/notes/my-note.mdoc"))).toBe(
      true
    );
    expect(fs.existsSync(path.join(repo, "content/notes/my-note-2.mdoc"))).toBe(
      true
    );
  });
});
