/**
 * sync-resume.ts — single source of truth for the resume.
 *
 * Reads content/resume.source.yaml and regenerates:
 *   - content/resume.yaml              (subset the Keystatic `resume` singleton reads)
 *   - resume-variants/Resume-A|B|C.md  (full application resumes, summary swapped per variant)
 *
 * Run: pnpm sync:resume   (add --dry-run to preview without writing)
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "content/resume.source.yaml");
const SITE_OUT = path.join(ROOT, "content/resume.yaml");
const VARIANT_DIR = path.join(ROOT, "resume-variants");

const dryRun = process.argv.includes("--dry-run");

type Skill = { label: string; items: string[] };
type Exp = {
  org: string;
  role: string;
  period: string;
  detail: string;
  highlights: string[];
  tech: string[];
};
type Earlier = { org: string; role: string; period: string; detail: string };
type Project = { name: string; detail: string; url: string };
type Edu = { school: string; credential: string; year: string };
type VariantMeta = { label: string; useWhen: string };
type SkillGroup = { label: string; accent: string; items: string[] };
type Source = {
  siteSummary: string;
  siteBio: string;
  siteSkillGroups: SkillGroup[];
  careerStart: string;
  siteStatus: string;
  resumePdf: string;
  summaries: Record<string, string>;
  variantMeta: Record<string, VariantMeta>;
  skills: Skill[];
  experience: Exp[];
  earlier: Earlier[];
  projects: Project[];
  education: Edu[];
};

const src = yaml.load(fs.readFileSync(SRC, "utf8")) as Source;

// --- 1. Site subset (matches keystatic.config.ts `resume` singleton) ---
// stamp "last updated" (YYYY.MM) at sync time
const now = new Date();
const updated = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(
  2,
  "0"
)}`;

const site = {
  summary: src.siteSummary,
  bio: src.siteBio,
  resumePdf: src.resumePdf,
  careerStart: src.careerStart,
  status: src.siteStatus,
  updated,
  skillGroups: src.siteSkillGroups,
  experience: src.experience,
  earlier: src.earlier,
  education: src.education,
};
const siteYaml = yaml.dump(site, { lineWidth: -1, noRefs: true });

// --- 2. Markdown variant renderer ---
function renderVariant(key: string): string {
  const meta = src.variantMeta[key];
  const summary = src.summaries[key];
  const L: string[] = [];

  L.push("**Kendall Adkins**  ");
  L.push("**Senior Software Engineer**  ");
  L.push("adkins.kendall90@gmail.com • San Diego, CA  ");
  L.push("https://kendalladkins.dev  ");
  L.push("https://www.linkedin.com/in/adkinskendall/");
  L.push("");
  L.push(`<!-- Resume ${key} — ${meta.label}. Use when: ${meta.useWhen} -->`);
  L.push("");
  L.push("**Summary**");
  L.push("");
  L.push(summary);
  L.push("");
  L.push("**Skills**");
  L.push("");
  for (const s of src.skills) L.push(`* **${s.label}**: ${s.items.join(", ")}`);
  L.push("");
  L.push("**Experience**");
  L.push("");
  for (const e of src.experience) {
    L.push(`**${e.org} — ${e.role}** | ${e.period}  `);
    L.push(`*${e.detail}*`);
    L.push("");
    for (const h of e.highlights) L.push(`* ${h}`);
    L.push(`* *Tech:* ${e.tech.join(", ")}`);
    L.push("");
  }
  L.push("**Earlier Experience**  ");
  for (const e of src.earlier)
    L.push(`${e.org} — ${e.role} | ${e.period} • ${e.detail}  `);
  L.push("");
  L.push("**Projects**");
  L.push("");
  for (const p of src.projects) L.push(`* ${p.name}: ${p.detail} ${p.url}`);
  L.push("");
  L.push("**Education**  ");
  for (const ed of src.education)
    L.push(`${ed.school} — ${ed.credential}, ${ed.year}`);
  L.push("");
  return L.join("\n");
}

const variants = Object.keys(src.summaries).map((key) => ({
  key,
  file: path.join(VARIANT_DIR, `Resume-${key}.md`),
  content: renderVariant(key),
}));

// --- 3. Write (or preview) ---
if (dryRun) {
  console.log("[dry-run] Would write:");
  console.log(`  • ${path.relative(ROOT, SITE_OUT)}  (site subset)`);
  for (const v of variants)
    console.log(
      `  • ${path.relative(ROOT, v.file)}  (${src.variantMeta[v.key].label})`
    );
  console.log("\nNo files written. Re-run without --dry-run to apply.");
} else {
  fs.mkdirSync(VARIANT_DIR, { recursive: true });
  fs.writeFileSync(SITE_OUT, siteYaml);
  for (const v of variants) fs.writeFileSync(v.file, v.content);
  console.log("Synced from content/resume.source.yaml:");
  console.log(`  • ${path.relative(ROOT, SITE_OUT)}  (site subset)`);
  for (const v of variants)
    console.log(
      `  • ${path.relative(ROOT, v.file)}  (${src.variantMeta[v.key].label})`
    );
  console.log("\nDone. Review `git diff`, then commit when ready.");
}
