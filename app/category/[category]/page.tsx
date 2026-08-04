import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNews, type NewsItem } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";
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

      {/* Manşet — büyük görsel, başlık resim içinde */}
      {headline && (
        <Link href={`/news/${headline.slug}`} className="group relative block rounded-lg overflow-hidden min-h-[300px] md:min-h-[440px] mb-10">
          {headline.image ? (
            <img src={headline.image} alt={headline.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-surface2" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className="text-white/60 text-xs">{formatDate(headline.publishedAt)}</span>
            <h2 className="mt-2 text-2xl md:text-4xl font-black text-white leading-tight group-hover:text-red-300 transition">{headline.title}</h2>
            {headline.excerpt && <p className="mt-3 text-white/60 text-sm md:text-base line-clamp-2 max-w-2xl hidden md:block">{headline.excerpt}</p>}
            <p className="mt-3 text-white/40 text-xs">By {headline.author}</p>
          </div>
        </Link>
      )}

      {/* Haber ızgarası */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map((item: NewsItem) => (
          <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group block rounded-lg overflow-hidden border border-borderc bg-surface2/40 hover:border-brand/40 transition">
            {item.image ? (
              <div className="h-44 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            ) : (
              <div className="h-44 bg-gradient-to-br from-borderc to-surface2 flex items-center justify-center">
                <span className="text-2xl font-black text-brand">{item.category.charAt(0)}</span>
              </div>
            )}
            <div className="p-4">
              <span className="text-[10px] font-bold uppercase text-brand">{item.category}</span>
              <h3 className="mt-1.5 text-[15px] font-bold text-textc group-hover:text-brand transition leading-snug line-clamp-3">{item.title}</h3>
              <p className="text-[11px] text-mutedc mt-2">{formatDate(item.publishedAt)} · By {item.author}</p>
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
