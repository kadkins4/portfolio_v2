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
