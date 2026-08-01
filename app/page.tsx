import Link from "next/link";
import { fetchNews, type NewsItem } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NewsCard({ item, large = false }: { item: NewsItem; large?: boolean }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className={`group block rounded-xl overflow-hidden border border-borderc bg-surface2/40 hover:border-zinc-600 hover:bg-surface2 transition ${
        large ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      {item.image ? (
        <div className={`${large ? "h-72 md:h-80" : "h-48"} overflow-hidden`}>
          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        </div>
      ) : (
        <div className={`${large ? "h-72 md:h-80" : "h-48"} bg-gradient-to-br from-borderc to-surface2 flex items-center justify-center`}>
          <span className="text-6xl font-black text-zinc-700">T</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-red-500">{item.category}</span>
          <span className="text-xs text-mutedc">{formatDate(item.publishedAt)}</span>
        </div>
        <h3 className={`font-bold text-textc group-hover:text-white leading-snug ${large ? "text-2xl md:text-3xl" : "text-lg"}`}>
          {item.title}
        </h3>
        {large && item.excerpt && <p className="mt-3 text-mutedc line-clamp-3">{item.excerpt}</p>}
        <p className="mt-3 text-xs text-mutedc">By {item.author}</p>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [data, featuredData] = await Promise.all([
    fetchNews({ limit: 15 }),
    fetchNews({ featured: true }),
  ]);
  const news = data.news;
  const featured = featuredData.news;
  const hero = featured[0] || news[0];
  const rest = (hero ? news.filter((n) => n.slug !== hero.slug) : news).slice(0, 14);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-3 border border-borderc rounded-lg px-4 py-2.5 mb-8 bg-surface2/40 overflow-hidden">
        <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Breaking
        </span>
        <span className="text-sm text-mutedc truncate">
          {hero ? hero.title : "Loading latest headlines..."}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-fr">
        {hero && <NewsCard item={hero} large />}
        {rest.slice(0, 4).map((item) => (
          <NewsCard key={item.id || item.slug} item={item} />
        ))}
      </div>

      <section className="mt-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tight text-textc">
            Latest <span className="text-red-500">Headlines</span>
          </h2>
          <Link href="/category/world" className="text-sm text-mutedc hover:text-textc transition">View all →</Link>
        </div>
        <div className="divide-y divide-borderc border-y border-borderc">
          {rest.slice(4, 14).map((item, i) => (
            <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="flex items-start gap-4 py-5 group">
              <span className="text-2xl font-black text-zinc-600 group-hover:text-red-500 transition w-8 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-textc group-hover:text-white transition leading-snug">{item.title}</h3>
                <p className="mt-1 text-xs text-mutedc">{item.category} · {formatDate(item.publishedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
