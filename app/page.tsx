import Link from "next/link";
import { fetchNews, type NewsItem } from "@/lib/api";
import EditorsPicks from "./components/EditorsPicks";
import MostRead from "./components/MostRead";
import TrendingTopics from "./components/TrendingTopics";
import NewsletterSignup from "./components/NewsletterSignup";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

const CATEGORY_SECTIONS = ["World", "Technology", "Business", "Sports", "Science", "Health", "Entertainment"];

const CATEGORY_LABELS: Record<string, string> = {
  World: "Dünya",
  Technology: "Teknoloji",
  Business: "Ekonomi",
  Sports: "Spor",
  Science: "Bilim",
  Health: "Sağlık",
  Entertainment: "Magazin",
};

function HeroCard({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.slug}`} className="group relative block rounded-lg overflow-hidden min-h-[280px] md:min-h-[520px]">
      {item.image ? (
        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand/30 to-surface2" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-brand text-white text-[10px] font-black uppercase px-2.5 py-1 rounded tracking-wider">Son Dakika</span>
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
  const [lead, ...rest] = items;

  return (
    <section>
      {/* Bölüm başlığı — kırmızı bar + başlık + Tümü */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 bg-brand rounded-full" />
          <h2 className="text-[22px] font-extrabold text-textc tracking-tight">{CATEGORY_LABELS[category] || category}</h2>
        </div>
        <Link href={`/category/${category.toLowerCase()}`} className="text-xs font-bold text-mutedc hover:text-brand transition uppercase tracking-wide">
          Tümü →
        </Link>
      </div>

      {/* Izgara — lead + 4 yan haber */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lead — büyük fotoğraflı */}
        <Link href={`/news/${lead.slug}`} className="group relative block rounded-lg overflow-hidden min-h-[240px] md:row-span-2">
          {lead.image ? (
            <img src={lead.image} alt={lead.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-surface2" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 p-5">
            <span className="text-white/50 text-[10px]">{formatDate(lead.publishedAt)}</span>
            <h3 className="mt-1 font-black text-white leading-snug text-lg group-hover:text-red-300 transition">{lead.title}</h3>
            {lead.excerpt && <p className="mt-2 text-white/50 text-xs line-clamp-2 hidden md:block">{lead.excerpt}</p>}
          </div>
        </Link>

        {/* Yan haberler */}
        {rest.slice(0, 4).map((item) => (
          <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group flex gap-3 rounded-lg border border-borderc bg-surface2/40 hover:border-zinc-600 transition p-3">
            {item.image && (
              <div className="w-24 h-20 rounded-md overflow-hidden shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-brand">{CATEGORY_LABELS[item.category] || item.category}</span>
              <h4 className="text-sm font-semibold text-textc group-hover:text-brand transition leading-snug mt-0.5 line-clamp-3">{item.title}</h4>
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
  const secondary = rest.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8">
      {/* Manşet — büyük lead + 3 ikincil manşet */}
      {hero && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HeroCard item={hero} />
          </div>
          {/* İkincil Manşetler — fotoğraflı kartlar */}
          <div className="hidden lg:flex flex-col gap-5">
            {secondary.map((item) => (
              <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group flex gap-4 items-center">
                {item.image ? (
                  <div className="w-[130px] h-[90px] rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                ) : (
                  <div className="w-[130px] h-[90px] rounded-lg bg-surface2 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-bold tracking-wider text-brand">{CATEGORY_LABELS[item.category] || item.category}</span>
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
              Canlı
            </span>
            <p className="text-sm text-mutedc truncate">Gündemdeki son dakika gelişmelerini anlık takip edin</p>
            <Link href="/category/world" className="shrink-0 text-xs font-bold text-brand hover:text-brand transition">Tümü →</Link>
          </div>
        </div>

        {/* Kenar Çubuğu */}
        <aside className="space-y-12">
          {/* Gündem listesi */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-brand rounded-full" />
              <h2 className="text-[20px] font-extrabold text-textc tracking-tight">Gündem</h2>
            </div>
            <div className="divide-y divide-borderc border-y border-borderc">
              {trending.map((item, i) => (
                <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="flex items-start gap-3 py-3.5 group">
                  <span className="text-lg font-black text-zinc-700 group-hover:text-brand transition w-6 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-brand">{CATEGORY_LABELS[item.category] || item.category}</span>
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
