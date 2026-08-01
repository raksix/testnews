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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Category</p>
        <h1 className="text-4xl font-black text-textc">{name} News</h1>
        <p className="text-mutedc mt-2">{news.length} article{news.length !== 1 ? "s" : ""} · Latest updates</p>
      </div>

      {headline && (
        <Link href={`/news/${headline.slug}`} className="group block rounded-xl overflow-hidden border border-borderc hover:border-zinc-600 bg-surface2/40 transition mb-8">
          {headline.image && (
            <div className="h-64 md:h-80 overflow-hidden">
              <img src={headline.image} alt={headline.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
          )}
          <div className="p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-textc group-hover:text-white leading-snug">{headline.title}</h2>
            <p className="mt-3 text-mutedc line-clamp-3">{headline.excerpt}</p>
            <p className="mt-3 text-xs text-mutedc">By {headline.author} · {formatDate(headline.publishedAt)}</p>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rest.map((item: NewsItem) => (
          <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group block rounded-xl overflow-hidden border border-borderc hover:border-zinc-600 bg-surface2/40 transition">
            {item.image && (
              <div className="h-44 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-textc group-hover:text-white leading-snug">{item.title}</h3>
              <p className="mt-2 text-xs text-mutedc">{formatDate(item.publishedAt)} · {item.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
