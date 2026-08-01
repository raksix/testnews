import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNewsBySlug, fetchNews, type NewsItem } from "@/lib/api";

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
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith("- ")) {
      return (
        <ul key={i} className="list-disc pl-6 space-y-2 my-4 text-zinc-300">
          {block.split("\n").map((line, j) => (
            <li key={j}>{line.replace(/^- /, "")}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="text-zinc-300 leading-relaxed my-4 text-[17px]">
        {block}
      </p>
    );
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [news, relatedData] = await Promise.all([
    fetchNewsBySlug(slug),
    fetchNews({ limit: 6 }),
  ]);
  const related = relatedData.news;
  if (!news) notFound();

  const relatedItems = related.filter((r) => r.slug !== slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-3 mb-6 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-white transition">
          Home
        </Link>
        <span className="text-zinc-700">/</span>
        <Link
          href={`/category/${news.category.toLowerCase()}`}
          className="text-red-500 hover:text-red-400 transition font-semibold uppercase text-xs tracking-wide"
        >
          {news.category}
        </Link>
      </div>

      <h1 className="text-3xl md:text-5xl font-black leading-tight text-white">
        {news.title}
      </h1>

      <div className="flex items-center gap-3 mt-6 pb-6 border-b border-zinc-800">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center font-bold text-white">
          {news.author.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-200">{news.author}</p>
          <p className="text-xs text-zinc-500">{formatDate(news.publishedAt)}</p>
        </div>
      </div>

      {news.image && (
        <div className="mt-8 rounded-xl overflow-hidden border border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      )}

      {news.excerpt && (
        <p className="mt-8 text-xl text-zinc-200 font-medium leading-relaxed border-l-4 border-red-600 pl-4">
          {news.excerpt}
        </p>
      )}

      <article className="mt-6">{renderContent(news.content)}</article>

      {relatedItems.length > 0 && (
        <div className="mt-16 border-t border-zinc-800 pt-8">
          <h2 className="text-xl font-black mb-6">More News</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedItems.map((item: NewsItem) => (
              <Link
                key={item.id || item.slug}
                href={`/news/${item.slug}`}
                className="group block p-4 rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 transition"
              >
                <span className="text-xs font-bold uppercase text-red-500">
                  {item.category}
                </span>
                <h3 className="mt-1.5 font-semibold text-zinc-200 group-hover:text-white leading-snug">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
