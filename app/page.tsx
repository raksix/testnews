import Link from "next/link";
import { fetchNews, imgUrl, type NewsItem } from "@/lib/api";
import EditorsPicks from "./components/EditorsPicks";
import MostRead from "./components/MostRead";
import TrendingTopics from "./components/TrendingTopics";
import NewsletterSignup from "./components/NewsletterSignup";
import DragScroll from "./components/DragScroll";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const CATEGORY_SECTIONS = ["World", "Technology", "Business", "Sports", "Science", "Health", "Entertainment"];


function HeroCard({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.slug}`} className="group relative block rounded-lg overflow-hidden min-h-[280px] md:min-h-[520px] h-full">
      {item.image ? (
        <img src={imgUrl(item.image)} alt={item.title} fetchPriority="high" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand/30 to-surface2" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-brand text-white text-[10px] font-black uppercase px-2.5 py-1 rounded tracking-wider">Breaking</span>
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

function CategorySection({ category, items }: { category: string; items: NewsItem[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      {/* Bölüm başlığı — kırmızı bar + başlık + View All */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-[4px] h-[22px] bg-brand rounded-[2px]" />
          <h2 className="text-[21px] font-extrabold text-textc tracking-tight">{category}</h2>
        </div>
        <Link
          href={`/category/${category.toLowerCase()}`}
          className="flex items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand/80 transition"
        >
          View All
          <svg viewBox="0 0 14 14" className="w-[15px] h-[15px]" fill="currentColor">
            <path d="M5.09619 2.93945q-0.25293 0.08545-0.37939 0.30762-0.04102 0.08545-0.04102 0.25293 0 0.16748 0.04102 0.25293 0.04443 0.08203 1.62353 1.66455l1.58252 1.58252-1.58252 1.58252q-1.5791 1.58252-1.62353 1.66797-0.04102 0.08203-0.04102 0.23584 0 0.15381 0.03418 0.23926 0.0376 0.08203 0.1333 0.18115 0.09912 0.0957 0.18115 0.1333 0.08545 0.03418 0.23926 0.03418 0.15381 0 0.24268-0.04785 0.09229-0.05127 1.90381-1.8628 1.81494-1.81494 1.86279-1.9038 0.05127-0.09229 0.05127-0.25977 0-0.16748-0.04443-0.24951-0.04102-0.08545-1.85938-1.90723l-1.44238-1.42871q-0.33496-0.33496-0.46143-0.41699-0.09912-0.07178-0.19824-0.07178l-0.04102 0q-0.14014 0-0.18115 0.01367z" />
          </svg>
        </Link>
      </div>

      {/* Yatay satır — foto üstte, başlık altta */}
      <DragScroll className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
        {items.slice(0, 5).map((item) => (
          <Link
            key={item.id || item.slug}
            href={`/news/${item.slug}`}
            className="group flex-[1_1_0] min-w-[220px] max-w-[320px]"
          >
            <div className="w-full h-[180px] rounded-[8px] overflow-hidden bg-surface2">
              {item.image ? (
                <img src={imgUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand/15 to-surface2 flex items-center justify-center">
                  <span className="text-3xl font-black text-brand/50">{item.category.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="mt-2.5">
              <span className="text-[10px] font-bold uppercase text-brand">{item.category}</span>
              <h3 className="mt-1 text-[15px] font-bold text-textc group-hover:text-brand transition leading-snug line-clamp-2">{item.title}</h3>
              <p className="text-[11px] text-mutedc mt-1">{formatDate(item.publishedAt)}</p>
            </div>
          </Link>
        ))}
      </DragScroll>
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
  const rest = hero ? news.filter((n) => n.slug !== hero.slug) : news;

  // Group by category for category sections
  const byCategory = new Map<string, NewsItem[]>();
  for (const item of rest) {
    const arr = byCategory.get(item.category) || [];
    if (arr.length < 5) arr.push(item);
    byCategory.set(item.category, arr);
  }

  // Trending: first 5 for the sidebar
  const trending = rest.slice(0, 5);
  // Secondary headlines: 3 for the hero right column
  const secondary = rest.slice(0, 4);

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8">
      {/* Manşet — büyük lead + 3 ikincil manşet */}
      {hero && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HeroCard item={hero} />
          </div>
          {/* İkincil Manşetler — fotoğraflı kartlar */}
          <div className="hidden lg:flex flex-col justify-between gap-5">
            {secondary.map((item) => (
              <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group flex gap-4 items-center">
                {item.image ? (
                  <div className="w-[130px] h-[90px] rounded-lg overflow-hidden shrink-0">
                    <img src={imgUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                ) : (
                  <div className="w-[130px] h-[90px] rounded-lg bg-surface2 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-bold tracking-wider text-brand">{item.category}</span>
                  <h3 className="text-[15px] font-bold text-textc group-hover:text-brand transition leading-snug mt-1 line-clamp-3">{item.title}</h3>
                  <p className="text-[11px] text-mutedc mt-1.5">{formatDate(item.publishedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Gövde — Haber Kolonu (2/3) + Kenar Çubuğu (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-14">
        {/* Haber Kolonu — kategori bölümleri */}
        <div className="lg:col-span-2 space-y-16">
          {CATEGORY_SECTIONS.map((cat) => (
            <CategorySection key={cat} category={cat} items={byCategory.get(cat) || []} />
          ))}

          {/* Live bar */}
          <div className="flex items-center gap-3 border border-borderc rounded-xl px-5 py-3 bg-surface2/40 overflow-hidden">
            <span className="flex items-center gap-1.5 bg-brand text-white text-xs font-black uppercase px-2.5 py-1 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
            <p className="text-sm text-mutedc truncate">Stay updated with the latest breaking news around the clock</p>
            <Link href="/category/world" className="shrink-0 text-xs font-bold text-brand hover:text-brand transition">View All →</Link>
          </div>
        </div>

        {/* Kenar Çubuğu */}
        <aside className="space-y-12">
          {/* Gündem listesi */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-brand rounded-full" />
              <h2 className="text-[20px] font-extrabold text-textc tracking-tight">Trending</h2>
            </div>
            <div className="divide-y divide-borderc border-y border-borderc">
              {trending.map((item, i) => (
                <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="flex items-start gap-3 py-3.5 group">
                  <span className="text-lg font-black text-zinc-700 group-hover:text-brand transition w-6 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-brand">{item.category}</span>
                    <h3 className="text-sm font-semibold text-textc group-hover:text-brand transition leading-snug mt-0.5">{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <EditorsPicks />
          <MostRead />
          <TrendingTopics />
        </aside>
      </div>

      {/* Newsletter */}
      <NewsletterSignup />
    </div>
  );
}
