import type { SocialLink } from "@/components/holo/ContactDispatch";

type SiteSettingsLike = {
  socialLinks?: readonly { platform: string; url: string }[];
} | null;

// Map Keystatic site settings to the ContactDispatch socials shape. Returns
// undefined when there are none so the block falls back to its defaults.
export function toSocialLinks(
  settings: SiteSettingsLike
): SocialLink[] | undefined {
  const links = (settings?.socialLinks ?? []).map((s) => ({
    platform: s.platform,
    url: s.url,
  }));
  return links.length ? links : undefined;
}
