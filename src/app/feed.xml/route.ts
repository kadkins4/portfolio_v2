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

type FeedEntry = {
  title: string;
  description: string;
  url: string;
  date: string;
};

export async function GET() {
  const reader = createReader(process.cwd(), config);
  const [projects, notes] = await Promise.all([
    reader.collections.projects.all(),
    reader.collections.notes.all(),
  ]);

  const entries: FeedEntry[] = [
    ...projects
      .filter((p) => p.entry.date)
      .map((p) => ({
        title: p.entry.title,
        description: p.entry.description,
        url: `${SITE_URL}/projects/${p.slug}`,
        date: p.entry.date!,
      })),
    ...notes
      .filter((n) => n.entry.date)
      .map((n) => ({
        title: n.entry.title,
        description: n.entry.summary,
        url: `${SITE_URL}/notes/${n.slug}`,
        date: n.entry.date!,
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items = entries
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} — Studio</title>
    <link>${SITE_URL}/studio</link>
    <description>Projects and notes by Kendall Adkins.</description>
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
