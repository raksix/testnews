export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3013";

export interface NewsItem {
  id?: string;
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  featured: boolean;
  publishedAt: string;
}

export async function fetchNews(opts?: {
  category?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
}): Promise<{ news: NewsItem[]; categories?: { category: string; count: number }[] }> {
  const params = new URLSearchParams();
  if (opts?.category) params.set("category", opts.category);
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.offset) params.set("offset", String(opts.offset));
  if (opts?.featured) params.set("featured", "1");
  const res = await fetch(`${API_URL}/api/news?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchNewsBySlug(slug: string): Promise<NewsItem | null> {
  const res = await fetch(`${API_URL}/api/news/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.news || null;
}

// Bump this when image files change to bust stale browser/CF caches
export const IMG_VERSION = "v2";
export function imgUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("/upload/")) {
    return `${src}${src.includes("?") ? "&" : "?"}${IMG_VERSION}`;
  }
  return src;
}
