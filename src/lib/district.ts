// Project "districts" — the neon-city categorization that colors project cards,
// the detail page, and the city. An explicit Keystatic `district` field wins;
// otherwise it's derived from the slug (Kenny's approved mapping), falling back
// to tag keywords for anything new.

export type DistrictKey = "sports" | "games" | "tools" | "client-web";

export type District = {
  key: DistrictKey;
  label: string;
  hue: number;
  chroma: number;
};

export const DISTRICTS: Record<DistrictKey, District> = {
  sports: { key: "sports", label: "Sports", hue: 190, chroma: 0.13 },
  games: { key: "games", label: "Games", hue: 340, chroma: 0.16 },
  tools: { key: "tools", label: "Tools", hue: 300, chroma: 0.11 },
  "client-web": {
    key: "client-web",
    label: "Client Web",
    hue: 46,
    chroma: 0.14,
  },
};

const SLUG_DISTRICT: Record<string, DistrictKey> = {
  "the-score-bet": "sports",
  "the-score-media": "sports",
  loresmith: "games",
  "ricochet-rogue": "games",
  "on-the-clock": "tools",
  vantage: "tools",
  "arbutus-recreation-center": "client-web",
  "diggs-johnson-museum": "client-web",
  saul: "client-web",
};

export function isDistrictKey(v: unknown): v is DistrictKey {
  return typeof v === "string" && v in DISTRICTS;
}

export function districtOf(
  slug: string,
  tags: string[] = [],
  explicit?: string | null
): District {
  // an explicit Keystatic district field wins over any derivation
  if (isDistrictKey(explicit)) return DISTRICTS[explicit];
  const known = SLUG_DISTRICT[slug];
  if (known) return DISTRICTS[known];
  const hay = tags.join(" ").toLowerCase();
  if (/game/.test(hay)) return DISTRICTS.games;
  if (/bet|sport|score/.test(hay)) return DISTRICTS.sports;
  if (/tool|app|draft/.test(hay)) return DISTRICTS.tools;
  return DISTRICTS["client-web"];
}

// Build an oklch color string for a district at a given lightness/alpha.
export function districtColor(
  d: District,
  lightness = 0.84,
  alpha?: number
): string {
  const a = alpha != null ? ` / ${alpha}` : "";
  return `oklch(${lightness} ${d.chroma} ${d.hue}${a})`;
}
