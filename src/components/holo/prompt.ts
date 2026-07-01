// Single source of truth for the terminal prompt string. Derived from the
// display name so the shell prompt, typed commands, and interactive shells all
// agree — change the name once and every prompt follows. Previously this was
// derived in TypedReveal but hardcoded as "kendall@adkins:~$" in SelectedWork
// and CareerLog, which would silently drift if the name ever changed.
export function promptFor(name: string): string {
  const first = name.split(" ")[0]?.toLowerCase() || "kendall";
  return `${first}@adkins:~$`;
}
