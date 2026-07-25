import { DESTINATIONS } from "./cityData";

export type FastTravelItem = { key: string; label: string; hue: number | null };

// Home + every destination, in HUD order. Single source for both the desktop
// fast-travel bar and the mobile drawer so the two lists can't drift apart.
export const FAST_TRAVEL_ITEMS: FastTravelItem[] = [
  { key: "home", label: "> leave the city", hue: null },
  ...DESTINATIONS.map((d) => ({ key: d.key, label: d.key, hue: d.hue })),
];
