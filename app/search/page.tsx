import Link from "next/link";
import { fetchNews, type NewsItem } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  let results: NewsItem[] = [];

  if (query) {
    const data = await fetchNews({ limit: 30 });
    const lower = query.toLowerCase();
    results = data.news.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.excerpt.toLowerCase().includes(lower) ||
        n.category.toLowerCase().includes(lower) ||
        n.author.toLowerCase().includes(lower)
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-black text-textc mb-2">
        {query ? (
          <>Search: <span className="text-brand">&quot;{query}&quot;</span></>
        ) : (
          "Search News"
        )}
      </h1>
      <p className="text-mutedc text-sm mb-8">
        {query ? `${results.length} result${results.length !== 1 ? "s" : ""} found` : "Type a query to search articles"}
      </p>

      {results.length > 0 && (
        <div className="divide-y divide-borderc border-y border-borderc">
          {results.map((item) => (
            <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="flex items-start gap-4 py-5 group">
              {item.image && (
                <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-brand">{item.category}</span>
                <h3 className="font-semibold text-textc group-hover:text-white transition leading-snug">{item.title}</h3>
                <p className="text-xs text-mutedc mt-1 line-clamp-1">{item.excerpt}</p>
                <p className="text-[10px] text-mutedc mt-1">{formatDate(item.publishedAt)} · {item.author}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-mutedc">No results found for &quot;{query}&quot;</p>
          <Link href="/" className="text-brand hover:text-brand text-sm font-semibold mt-4 inline-block">← Back to Home</Link>
        </div>
      )}
    </div>
  );
}
