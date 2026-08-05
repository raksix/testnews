import { fetchNews } from "@/lib/api";

export const dynamic = "force-dynamic";

const SITE = "https://newsluma.com";
const PUBLISHER = "Newsluma";
const LANGUAGE = "en";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const { news } = await fetchNews({ limit: 100 });

  // Google News: only stories from the last 48 hours
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recent = news.filter((n) => new Date(n.publishedAt).getTime() >= cutoff);

  const items = recent
    .map((n) => {
      const pubDate = new Date(n.publishedAt).toUTCString();
      const link = `${SITE}/news/${n.slug}`;
      return `    <item>
      <title>${esc(n.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(n.excerpt || n.title)}</description>
      <category>${esc(n.category)}</category>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:news="http://purl.org/rss/1.0/modules/news/">
  <channel>
    <title>${esc(PUBLISHER)}</title>
    <link>${SITE}</link>
    <description>Google News feed for ${esc(PUBLISHER)}</description>
    <language>${LANGUAGE}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <news:publication>
      <news:name>${esc(PUBLISHER)}</news:name>
      <news:language>${LANGUAGE}</news:language>
    </news:publication>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
