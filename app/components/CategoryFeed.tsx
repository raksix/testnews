"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fetchNews, imgUrl, type NewsItem } from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CategoryFeed({ category, initial }: { category: string; initial: NewsItem[] }) {
  const [items, setItems] = useState<NewsItem[]>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(initial.length);
  const busyRef = useRef(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || busyRef.current || done) return;
        busyRef.current = true;
        setLoading(true);
        try {
          const { news } = await fetchNews({ category, limit: 12, offset: offsetRef.current });
          if (news.length === 0) {
            setDone(true);
          } else {
            setItems((prev) => [...prev, ...news]);
            offsetRef.current += news.length;
          }
        } catch {
          // transient error — allow retry on next intersect
        } finally {
          setLoading(false);
          busyRef.current = false;
        }
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [category, done]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            key={item.id || item.slug}
            href={`/news/${item.slug}`}
            className="group block rounded-lg overflow-hidden border border-borderc bg-surface2/40 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/5 transition"
          >
            <div className="relative">
              {item.image ? (
                <div className="h-44 overflow-hidden">
                  <img src={imgUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
              ) : (
                <div className="h-44 bg-gradient-to-br from-brand/20 to-surface2" />
              )}
              <span className="absolute top-3 left-3 bg-brand text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded tracking-wider">{item.category}</span>
            </div>
            <div className="p-4">
              <p className="text-[11px] text-mutedc mb-1.5">{formatDate(item.publishedAt)}</p>
              <h3 className="font-extrabold text-textc leading-snug group-hover:text-brand transition line-clamp-2">{item.title}</h3>
              {item.excerpt && <p className="mt-2 text-xs text-mutedc line-clamp-2">{item.excerpt}</p>}
              <p className="mt-2.5 text-[11px] text-mutedc/70">By {item.author}</p>
            </div>
          </Link>
        ))}
      </div>
      <div ref={sentinelRef} className="h-12" />
      {loading && <p className="text-center text-sm text-mutedc py-4">Loading more news…</p>}
      {done && <p className="text-center text-sm text-mutedc py-4">You&apos;ve reached the end 🎉</p>}
    </>
  );
}
