import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const reader = createReader(process.cwd(), config);
  const work = await reader.collections.projects.all();

  const sorted = [...work]
    .filter((w) => w.entry.date)
    .sort(
      (a, b) =>
        new Date(b.entry.date!).getTime() - new Date(a.entry.date!).getTime()
    );

  const items = sorted
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.entry.title)}</title>
      <link>${SITE_URL}/projects/${item.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/projects/${item.slug}</guid>
      <description>${escapeXml(item.entry.description)}</description>
      <pubDate>${new Date(item.entry.date!).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} — Projects</title>
    <link>${SITE_URL}/projects</link>
    <description>Projects by Kendall Adkins.</description>
    <language>en-us</language>
    <managingEditor>${process.env.CONTACT_EMAIL ?? "kendall@kendalladkins.dev"} (${SITE_NAME})</managingEditor>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
