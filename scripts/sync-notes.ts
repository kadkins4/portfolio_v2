import os from "node:os";
import path from "node:path";
import { runSync } from "./lib/sync-core";

const VAULT =
  process.env.OBSIDIAN_VAULT ??
  path.join(
    os.homedir(),
    "Library/Mobile Documents/iCloud~md~obsidian/Documents/MainVault"
  );

const dryRun = process.argv.includes("--dry-run");
const result = runSync({ vaultDir: VAULT, repoDir: process.cwd(), dryRun });

console.log(
  `\n${dryRun ? "[dry-run] " : ""}Publishing ${result.published.length} note(s):`
);
for (const n of result.published) {
  console.log(`  • ${n.title}  →  /notes/${n.slug}   (${n.sourcePath})`);
}
if (dryRun)
  console.log("\nNo files written. Re-run without --dry-run to apply.");
else console.log("\nDone. Review `git diff`, then commit and push.");
