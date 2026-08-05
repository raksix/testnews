import { fetchNews } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

const SITE = "https://newsluma.com";

export default async function sitemap() {
  const { news } = await fetchNews({ limit: 1000 });
  const url = (path: string) => ({ url: `${SITE}${path}`, lastModified: new Date() });

  const staticUrls = [url("/"), url("/search")].concat(
    CATEGORIES.map((c) => url(`/category/${c.toLowerCase()}`))
  );

  const newsUrls = news.map((n) => ({
    ...url(`/news/${n.slug}`),
    lastModified: new Date(n.publishedAt),
  }));

  return [...staticUrls, ...newsUrls];
}
