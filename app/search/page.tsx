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
    <div className="mx-auto max-w-[1320px] px-4 py-8">
      {/* Başlık + arama kutusu */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-1 h-7 bg-brand rounded-full" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-textc tracking-tight">Search</h1>
      </div>

      <form action="/search" method="GET" className="flex gap-3 mb-10">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search news, topics, authors…"
          className="flex-1 h-12 px-4 rounded-lg border border-borderc bg-surface text-textc placeholder:text-mutedc focus:outline-none focus:border-brand text-[15px]"
          autoFocus
        />
        <button
          type="submit"
          className="h-12 px-6 bg-brand hover:bg-brand/90 text-white text-[14px] font-semibold rounded-lg transition flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search
        </button>
      </form>

      {query && (
        <p className="text-sm text-mutedc mb-6">
          <span className="font-bold text-textc">{results.length}</span> result{results.length !== 1 ? "s" : ""} for{" "}
          <span className="font-bold text-brand">&quot;{query}&quot;</span>
        </p>
      )}

      {/* Sonuçlar — yatay kartlar */}
      {results.length > 0 && (
        <div className="divide-y divide-borderc border-y border-borderc">
          {results.map((item) => (
            <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="flex items-start gap-4 py-5 group">
              {item.image && (
                <div className="w-[140px] h-[90px] rounded-lg overflow-hidden shrink-0 hidden sm:block">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-brand">{item.category}</span>
                <h3 className="mt-1 font-bold text-textc group-hover:text-brand transition leading-snug text-[16px]">{item.title}</h3>
                <p className="text-xs text-mutedc mt-1 line-clamp-1">{item.excerpt}</p>
                <p className="text-[11px] text-mutedc mt-1.5">{formatDate(item.publishedAt)} · By {item.author}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Boş durumlar */}
      {!query && (
        <div className="text-center py-20 border border-dashed border-borderc rounded-xl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-4 text-mutedc">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <p className="text-mutedc">Type a keyword to search across all articles.</p>
        </div>
      )}

      {query && results.length === 0 && (
        <div className="text-center py-20 border border-dashed border-borderc rounded-xl">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-mutedc">No results found for &quot;{query}&quot;</p>
          <Link href="/" className="text-brand hover:text-brand text-sm font-semibold mt-4 inline-block">← Back to Home</Link>
        </div>
      )}
    </div>
  );
}
