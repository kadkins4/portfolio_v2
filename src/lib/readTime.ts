export function readTime(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "1 min read";
  const words = trimmed.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
