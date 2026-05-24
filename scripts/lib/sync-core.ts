import fs from "node:fs";
import path from "node:path";
import { isPublished, parseNote, type ParsedNote } from "./frontmatter";
import {
  transformWikilinks,
  transformCallouts,
  stripComments,
  transformEmbeds,
  type PublishedIndex,
} from "./transform";

export type SyncOptions = {
  vaultDir: string;
  repoDir: string;
  dryRun: boolean;
};
export type SyncResult = { published: ParsedNote[] };

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".obsidian" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function buildAssetIndex(vaultDir: string): Map<string, string> {
  const index = new Map<string, string>();
  const stack = [vaultDir];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".obsidian") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (!index.has(entry.name)) index.set(entry.name, full);
    }
  }
  return index;
}

function yamlFrontmatter(note: ParsedNote): string {
  const tags = note.tags.map((t) => `  - ${t}`).join("\n");
  return [
    "---",
    `title: ${note.title}`,
    `summary: ${JSON.stringify(note.summary)}`,
    note.tags.length ? `tags:\n${tags}` : "tags: []",
    `date: ${note.date}`,
    `sourcePath: ${JSON.stringify(note.sourcePath)}`,
    "---",
  ].join("\n");
}

export function runSync(opts: SyncOptions): SyncResult {
  const { vaultDir, repoDir, dryRun } = opts;
  const notesDir = path.join(repoDir, "content/notes");
  const imagesDir = path.join(repoDir, "public/images/notes");

  // 1. Collect published notes.
  const files = walk(vaultDir);
  const parsed: ParsedNote[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    if (!isPublished(raw)) continue;
    const rel = path.relative(vaultDir, file);
    const mtime = fs.statSync(file).mtimeMs;
    parsed.push(parseNote(raw, rel, mtime));
  }

  // 2. Build indexes for wikilink + asset resolution.
  const publishedIndex: PublishedIndex = new Map(
    parsed.map((n) => [n.title.toLowerCase(), n.slug])
  );
  const assetIndex = buildAssetIndex(vaultDir);
  // transformEmbeds passes the full embed target; resolve by basename.
  const resolveAsset = (name: string) =>
    assetIndex.get(name.split("/").pop() ?? name) ?? null;

  if (dryRun) return { published: parsed };

  // 3. Wipe and regenerate (idempotent).
  fs.rmSync(notesDir, { recursive: true, force: true });
  fs.rmSync(imagesDir, { recursive: true, force: true });
  fs.mkdirSync(notesDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.writeFileSync(path.join(notesDir, ".gitkeep"), "");
  fs.writeFileSync(path.join(imagesDir, ".gitkeep"), "");

  // 4. Transform and write each note.
  for (const note of parsed) {
    let body = stripComments(note.body);
    body = transformCallouts(body);
    body = transformWikilinks(body, publishedIndex);
    body = transformEmbeds(body, note.slug, resolveAsset, (from, to) => {
      const dest = path.join(imagesDir, to);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(from, dest);
    });
    const out = `${yamlFrontmatter(note)}\n${body}\n`;
    fs.writeFileSync(path.join(notesDir, `${note.slug}.mdoc`), out);
  }

  return { published: parsed };
}
