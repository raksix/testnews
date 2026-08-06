import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNews, imgUrl, type NewsItem } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";
const SITE = "https://newsluma.com";
import CategorySlider from "../../components/CategorySlider";
import CategoryFeed from "../../components/CategoryFeed";
export const dynamic = "force-dynamic";
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
const VALID = CATEGORIES.map((c) => c.toLowerCase());

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const name = CATEGORIES.find((c) => c.toLowerCase() === category) || category;
  return {
    title: `${name} News`,
    description: `Latest ${name} news and headlines from around the globe.`,
    alternates: { canonical: `${SITE}/category/${category}` },
    openGraph: {
      title: `${name} News`,
      description: `Latest ${name} news and headlines from around the globe.`,
      url: `${SITE}/category/${category}`,
      siteName: "Newsluma",
      locale: "en_US",
      type: "website",
      images: [{ url: `${SITE}/icon.png`, width: 512, height: 512 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} News`,
      description: `Latest ${name} news and headlines from around the globe.`,
    },
  };
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
              <img src={imgUrl(item.image)} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
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

      {/* Diğer haberler — sonsuz liste */}
      <CategoryFeed category={name} initial={rest.slice(6)} />    </div>
  );
}
