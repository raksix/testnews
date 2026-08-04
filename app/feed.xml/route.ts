import { fetchNews } from "@/lib/api";

export const dynamic = "force-dynamic";

const SITE = "https://testnews.fermag.com.tr";
const TITLE = "TestNews — Breaking News & Global Headlines";
const DESCRIPTION = "TestNews delivers breaking news, world headlines, technology, business, sports and science coverage — updated around the clock.";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const { news } = await fetchNews({ limit: 100 });

  const items = news
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
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:news="http://purl.org/rss/1.0/modules/news/">
  <channel>
    <title>${esc(TITLE)}</title>
    <link>${SITE}</link>
    <description>${esc(DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE}/icon.png</url>
      <title>${esc(TITLE)}</title>
      <link>${SITE}</link>
    </image>
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
