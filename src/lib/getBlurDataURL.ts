import { getPlaiceholder } from "plaiceholder";
import fs from "node:fs/promises";
import path from "node:path";

const blurCache = new Map<string, string>();

export async function getBlurDataURL(
  imagePath: string
): Promise<string | undefined> {
  if (!imagePath) return undefined;

  if (blurCache.has(imagePath)) {
    return blurCache.get(imagePath);
  }

  try {
    const fullPath = path.join(process.cwd(), "public", imagePath);
    const buffer = await fs.readFile(fullPath);
    const { base64 } = await getPlaiceholder(buffer, { size: 10 });
    blurCache.set(imagePath, base64);
    return base64;
  } catch (error) {
    console.warn(`Failed to generate blur for ${imagePath}:`, error);
    return undefined;
  }
}
