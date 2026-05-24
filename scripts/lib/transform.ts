// Resolve a wikilink target name -> published slug (or undefined).
export type PublishedIndex = Map<string, string>; // lowercased note title -> slug

export function transformWikilinks(
  md: string,
  published: PublishedIndex
): string {
  // Negative lookbehind avoids matching image/transclusion embeds (![[...]]).
  return md.replace(
    /(?<!!)\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g,
    (_match, rawName: string, rawAlias?: string) => {
      const name = rawName.trim();
      const alias = (rawAlias ?? name).trim();
      const slug = published.get(name.toLowerCase());
      return slug ? `[${alias}](/notes/${slug})` : alias;
    }
  );
}

const CALLOUT_RE = /^>\s*\[!(\w+)\]\s*(.*)$/;

export function transformCallouts(md: string): string {
  return md
    .split("\n")
    .map((line) => {
      const m = line.match(CALLOUT_RE);
      if (!m) return line;
      const [, type, title] = m;
      const label =
        title.trim() ||
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      return `> **${label}**`;
    })
    .join("\n");
}

export function stripComments(md: string): string {
  return md.replace(/%%[\s\S]*?%%/g, "");
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

// resolveAsset: embed name -> absolute source path (or null if not found).
// onCopy: called with (absoluteSource, "<slug>/<filename>") for each image to copy.
export function transformEmbeds(
  md: string,
  slug: string,
  resolveAsset: (name: string) => string | null,
  onCopy: (from: string, to: string) => void
): string {
  return md.replace(/!\[\[([^\]]+?)\]\]/g, (_m, rawTarget: string) => {
    const target = rawTarget.split("|")[0].trim();
    if (!IMAGE_EXT.test(target)) {
      console.warn(`[sync] skipping note transclusion: ![[${target}]]`);
      return "";
    }
    const source = resolveAsset(target);
    if (!source) {
      console.warn(`[sync] image not found in vault, dropping: ${target}`);
      return "";
    }
    const filename = target.split("/").pop()!;
    const alt = filename.replace(IMAGE_EXT, "");
    onCopy(source, `${slug}/${filename}`);
    return `![${alt}](/images/notes/${slug}/${filename})`;
  });
}
