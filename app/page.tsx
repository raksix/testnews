import Link from "next/link";
import { fetchNews, type NewsItem } from "@/lib/api";
import EditorsPicks from "./components/EditorsPicks";
import MostRead from "./components/MostRead";
import TrendingTopics from "./components/TrendingTopics";
import NewsletterSignup from "./components/NewsletterSignup";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const CATEGORY_SECTIONS = ["World", "Technology", "Business", "Sports", "Science", "Health", "Entertainment"];

function HeroCard({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.slug}`} className="group relative block rounded-2xl overflow-hidden col-span-1 md:col-span-3 min-h-[320px] md:min-h-[440px]">
      {item.image ? (
        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-surface2" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">Breaking</span>
          <span className="text-white/50 text-xs">{formatDate(item.publishedAt)}</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight group-hover:text-red-300 transition">{item.title}</h2>
        {item.excerpt && <p className="mt-3 text-white/60 text-sm md:text-base line-clamp-2 max-w-2xl hidden md:block">{item.excerpt}</p>}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">{item.author.charAt(0)}</div>
          <span className="text-white/40 text-xs">By {item.author}</span>
        </div>
      </div>
    </Link>
  );
}

function SmallCard({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.slug}`} className="group block rounded-xl overflow-hidden border border-borderc bg-surface2/40 hover:border-zinc-600 transition">
      {item.image ? (
        <div className="h-44 overflow-hidden">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-borderc to-surface2 flex items-center justify-center">
          <span className="text-4xl font-black text-zinc-700">T</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-red-500">{item.category}</span>
          <span className="text-[10px] text-mutedc">{formatDate(item.publishedAt)}</span>
        </div>
        <h3 className="font-bold text-textc group-hover:text-white leading-snug">{item.title}</h3>
      </div>
    </Link>
  );
}

function CategorySection({ category, items }: { category: string; items: NewsItem[] }) {
  if (items.length === 0) return null;
  const [lead, ...rest] = items;

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-red-600 rounded-full" />
          <h2 className="text-xl font-black text-textc tracking-tight">{category}</h2>
        </div>
        <Link href={`/category/${category.toLowerCase()}`} className="text-xs font-bold text-mutedc hover:text-red-500 transition uppercase tracking-wide">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Lead story — bigger */}
        <Link href={`/news/${lead.slug}`} className="group relative block rounded-xl overflow-hidden min-h-[260px] md:row-span-2">
          {lead.image ? (
            <img src={lead.image} alt={lead.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-surface2" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 p-5">
            <span className="text-white/50 text-[10px]">{formatDate(lead.publishedAt)}</span>
            <h3 className="mt-1 font-black text-white leading-snug text-xl group-hover:text-red-300 transition">{lead.title}</h3>
            {lead.excerpt && <p className="mt-2 text-white/50 text-xs line-clamp-2 hidden md:block">{lead.excerpt}</p>}
          </div>
        </Link>

        {/* Side stories */}
        {rest.slice(0, 2).map((item) => (
          <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group flex gap-3 rounded-xl border border-borderc bg-surface2/40 hover:border-zinc-600 transition p-3">
            {item.image && (
              <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-red-500">{item.category}</span>
              <h4 className="text-sm font-semibold text-textc group-hover:text-white transition leading-snug mt-0.5 line-clamp-3">{item.title}</h4>
              <p className="text-[10px] text-mutedc mt-1">{formatDate(item.publishedAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [data, featuredData] = await Promise.all([
    fetchNews({ limit: 50 }),
    fetchNews({ featured: true }),
  ]);
  const news = data.news;
  const featured = featuredData.news;

  const hero = featured[0] || news[0];
  const rest = (hero ? news.filter((n) => n.slug !== hero.slug) : news);

  // Group by category for category sections
  const byCategory = new Map<string, NewsItem[]>();
  for (const item of rest) {
    const arr = byCategory.get(item.category) || [];
    if (arr.length < 3) arr.push(item);
    byCategory.set(item.category, arr);
  }

  // Trending: first 5 of the remaining
  const trending = rest.slice(0, 5);
  // Latest headlines grid: next 12 after trending
  const latest = rest.slice(5, 17);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Hero — full width */}
      {hero && <HeroCard item={hero} />}

      {/* Trending + Latest mix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Trending sidebar */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-red-600 rounded-full" />
            <h2 className="text-lg font-black text-textc tracking-tight">Trending Now</h2>
          </div>
          <div className="divide-y divide-borderc border-y border-borderc">
            {trending.map((item, i) => (
              <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="flex items-start gap-3 py-3 group">
                <span className="text-lg font-black text-zinc-700 group-hover:text-red-500 transition w-6 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-red-500">{item.category}</span>
                  <h3 className="text-sm font-semibold text-textc group-hover:text-white transition leading-snug mt-0.5">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {latest.slice(0, 4).map((item) => (
            <SmallCard key={item.id || item.slug} item={item} />
          ))}
        </div>
      </div>

      {/* Editor's Picks */}
      <EditorsPicks />

      {/* Category sections */}
      {CATEGORY_SECTIONS.map((cat) => (
        <CategorySection key={cat} category={cat} items={byCategory.get(cat) || []} />
      ))}

      {/* Latest headlines full grid */}
      <section className="mt-16">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-red-600 rounded-full" />
          <h2 className="text-xl font-black text-textc tracking-tight">Latest Headlines</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {latest.slice(4).map((item) => (
            <SmallCard key={item.id || item.slug} item={item} />
          ))}
        </div>
      </section>

      {/* Live bar */}
      {rest.length > 0 && (
        <div className="mt-12 flex items-center gap-3 border border-borderc rounded-xl px-5 py-3 bg-surface2/40 overflow-hidden">
          <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </span>
          <p className="text-sm text-mutedc truncate">Stay updated with the latest breaking news from around the world</p>
          <Link href="/category/world" className="shrink-0 text-xs font-bold text-red-500 hover:text-red-400 transition">View All →</Link>
        </div>
      )}

      {/* Trending + Most Read */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <MostRead />
        <div>
          <TrendingTopics />
        </div>
      </div>

      {/* Newsletter */}
      <NewsletterSignup />
    </div>
  );
}
