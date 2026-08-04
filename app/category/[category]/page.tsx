import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNews, type NewsItem } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";
import CategorySlider from "../../components/CategorySlider";
export const dynamic = "force-dynamic";
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
const VALID = CATEGORIES.map((c) => c.toLowerCase());

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const name = CATEGORIES.find((c) => c.toLowerCase() === category) || category;
  return { title: `${name} News`, description: `Latest ${name} news and headlines from around the globe.` };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!VALID.includes(category)) notFound();
  const name = CATEGORIES.find((c) => c.toLowerCase() === category)!;
  const { news } = await fetchNews({ category: name, limit: 30 });
  const [headline, ...rest] = news;
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8">
      {/* Kategori başlığı — kırmızı bar + isim */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-7 bg-brand rounded-full" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-textc tracking-tight">{name} News</h1>
        </div>
        <p className="text-xs text-mutedc">{news.length} article{news.length !== 1 ? "s" : ""} · Latest updates</p>
      </div>

      {/* Otomatik slider — ilk 5 haber */}
      <CategorySlider items={[headline, ...rest.slice(0, 4)].filter(Boolean)} />

      {/* Öne çıkanlar — 2 geniş kart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {rest.slice(4, 6).map((item: NewsItem) => (
          <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group relative block rounded-lg overflow-hidden min-h-[280px] md:min-h-[320px] border border-borderc">
            {item.image ? (
              <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-surface2" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <span className="absolute top-3 left-3 bg-brand text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded tracking-wider">{item.category}</span>
            <span className="absolute top-3 right-3 bg-black/50 text-white/80 text-[10px] px-2 py-1 rounded">{formatDate(item.publishedAt)}</span>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="font-black text-white leading-snug text-lg md:text-xl group-hover:text-red-300 transition line-clamp-3">{item.title}</h3>
              {item.excerpt && <p className="mt-2 text-white/60 text-xs line-clamp-2 hidden md:block">{item.excerpt}</p>}
              <p className="mt-2.5 text-white/50 text-[11px]">By {item.author}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Diğer haberler — 3'lü grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.slice(6).map((item: NewsItem) => (
          <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group block rounded-lg overflow-hidden border border-borderc bg-surface2/40 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/5 transition">
            <div className="relative">
              {item.image ? (
                <div className="h-44 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
              ) : (
                <div className="h-44 bg-gradient-to-br from-borderc to-surface2 flex items-center justify-center">
                  <span className="text-2xl font-black text-brand">{item.category.charAt(0)}</span>
                </div>
              )}
              <span className="absolute top-3 left-3 bg-brand text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider">{item.category}</span>
            </div>
            <div className="p-4">
              <h3 className="text-[15px] font-bold text-textc group-hover:text-brand transition leading-snug line-clamp-3">{item.title}</h3>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-borderc">
                <span className="text-[11px] text-mutedc">By {item.author}</span>
                <span className="text-[11px] text-brand font-semibold">{formatDate(item.publishedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-20">
          <p className="text-mutedc">No articles in this category yet.</p>
          <Link href="/" className="text-brand text-sm font-semibold mt-3 inline-block">← Back to Home</Link>
        </div>
      )}
    </div>
  );
}
