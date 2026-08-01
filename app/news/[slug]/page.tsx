import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNewsBySlug, fetchNews, type NewsItem } from "@/lib/api";
import Comments from "@/app/components/Comments";
import InfiniteFeed from "@/app/components/InfiniteFeed";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function renderContent(content: string) {
  return content.split("\n\n").map((block, i) => {
    if (block.startsWith("## "))
      return <h2 key={i} className="text-2xl font-bold text-textc mt-10 mb-4">{block.slice(3)}</h2>;
    if (block.startsWith("### "))
      return <h3 key={i} className="text-xl font-bold text-textc mt-8 mb-3">{block.slice(4)}</h3>;
    if (block.startsWith("- "))
      return (
        <ul key={i} className="list-disc pl-6 space-y-2 my-4 text-mutedc">
          {block.split("\n").map((line, j) => <li key={j}>{line.replace(/^- /, "")}</li>)}
        </ul>
      );
    if (block.startsWith("> "))
      return (
        <blockquote key={i} className="border-l-4 border-red-500 pl-4 my-4 text-mutedc italic">
          {block.slice(2)}
        </blockquote>
      );
    return <p key={i} className="text-mutedc leading-relaxed my-4 text-[17px]">{block}</p>;
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await fetchNewsBySlug(slug);
  if (!news) return { title: "Article Not Found" };
  return {
    title: news.title,
    description: news.excerpt,
    openGraph: { title: news.title, description: news.excerpt, images: news.image ? [news.image] : [] },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [news, relatedData] = await Promise.all([
    fetchNewsBySlug(slug),
    fetchNews({ limit: 10 }),
  ]);
  const related = relatedData.news;
  if (!news) notFound();

  const relatedItems = related.filter((r) => r.slug !== slug).slice(0, 6);
  const rightSidebar = related.filter((r) => r.slug !== slug).slice(1, 5);

  return (
    <div className="bg-surface min-h-screen">
      {/* Full-width hero image */}
      {news.image && (
        <div className="relative h-[50vh] md:h-[65vh] overflow-hidden">
          <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-6xl mx-auto px-4 pb-8">
              <div className="flex items-center gap-3 mb-4">
                <Link href="/" className="text-white/60 hover:text-white text-sm transition">Home</Link>
                <span className="text-white/30">/</span>
                <Link href={`/category/${news.category.toLowerCase()}`} className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wide transition">{news.category}</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main article column */}
          <article className="lg:col-span-8 -mt-8 relative z-10">
            <h1 className="text-3xl md:text-5xl font-black leading-tight text-textc">{news.title}</h1>

            <div className="flex items-center gap-3 mt-6 pb-6 border-b border-borderc">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center font-bold text-white text-sm">{news.author.charAt(0)}</div>
              <div>
                <p className="text-sm font-semibold text-textc">{news.author}</p>
                <p className="text-xs text-mutedc">{formatDate(news.publishedAt)}</p>
              </div>
            </div>

            {!news.image && (
              <div className="flex items-center gap-3 mt-6 text-sm">
                <Link href="/" className="text-mutedc hover:text-textc transition">Home</Link>
                <span className="text-borderc">/</span>
                <Link href={`/category/${news.category.toLowerCase()}`} className="text-red-500 hover:text-red-400 transition font-semibold uppercase text-xs tracking-wide">{news.category}</Link>
              </div>
            )}

            {news.excerpt && (
              <p className="mt-8 text-xl text-textc font-medium leading-relaxed border-l-4 border-red-600 pl-5">{news.excerpt}</p>
            )}

            <div className="mt-8 prose-custom">{renderContent(news.content)}</div>

            <Comments slug={slug} />

            {/* Infinite feed: next articles load automatically on scroll */}
            <InfiniteFeed initialSlug={slug} />
          </article>

          {/* Sidebar — trending / more news */}
          {rightSidebar.length > 0 && (
            <aside className="lg:col-span-4 lg:pt-20">
              <div className="lg:sticky lg:top-24">
                <h3 className="text-sm font-black uppercase tracking-widest text-mutedc mb-4">More Stories</h3>
                <div className="divide-y divide-borderc border-t border-borderc">
                  {rightSidebar.map((item, i) => (
                    <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="flex items-start gap-3 py-4 group">
                      <span className="text-xl font-black text-zinc-700 group-hover:text-red-500 transition w-7 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-red-500">{item.category}</span>
                        <h4 className="text-sm font-semibold text-textc group-hover:text-white transition leading-snug mt-0.5">{item.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Related articles grid */}
        {relatedItems.length > 0 && (
          <div className="mt-16 border-t border-borderc pt-12 pb-8">
            <h2 className="text-2xl font-black mb-8 text-textc">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.slice(0, 6).map((item: NewsItem) => (
                <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group block rounded-xl overflow-hidden border border-borderc hover:border-zinc-600 bg-surface2/40 transition">
                  {item.image && (
                    <div className="h-40 overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase text-red-500">{item.category}</span>
                    <h3 className="mt-1 font-semibold text-textc group-hover:text-white leading-snug">{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
