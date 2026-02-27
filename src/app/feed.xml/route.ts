import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";

const BASE_URL = "https://kendalladkins.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const reader = createReader(process.cwd(), config);
  const posts = await reader.collections.posts.all();

  const sorted = [...posts]
    .filter((p) => p.entry.date)
    .sort((a, b) => new Date(b.entry.date!).getTime() - new Date(a.entry.date!).getTime());

  const items = sorted
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.entry.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.entry.excerpt)}</description>
      <pubDate>${new Date(post.entry.date!).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kendall Adkins — Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Thoughts on frontend engineering, design systems, and the web.</description>
    <language>en-us</language>
    <managingEditor>${process.env.CONTACT_EMAIL ?? "kendall@kendalladkins.com"} (Kendall Adkins)</managingEditor>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
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
