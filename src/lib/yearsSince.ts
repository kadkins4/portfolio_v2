// Full years elapsed since a "YYYY-MM" start date, relative to right now.
// Used to derive "N+ YRS" so it updates automatically with the current date.
export function yearsSince(start: string): number {
  const [y, m] = start.split("-").map(Number);
  if (!y) return 0;
  const now = new Date();
  let years = now.getFullYear() - y;
  if (m && now.getMonth() + 1 < m) years -= 1;
  return Math.max(0, years);
}
