"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, type NewsItem } from "@/lib/api";
import Comments from "./Comments";

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
    return <p key={i} className="text-mutedc leading-relaxed my-4 text-[17px]">{block}</p>;
  });
}

function ArticleBlock({ item }: { item: NewsItem }) {
  return (
    <article className="relative">
      {/* Hero image */}
      {item.image && (
        <div className="relative h-[45vh] md:h-[60vh] overflow-hidden rounded-2xl border border-borderc">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-brand text-xs font-bold uppercase tracking-wide bg-brand/10 px-2.5 py-1 rounded-full">{item.category}</span>
          <span className="text-xs text-mutedc">{formatDate(item.publishedAt)}</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black leading-tight text-textc">{item.title}</h2>

        <div className="flex items-center gap-3 mt-6 pb-6 border-b border-borderc">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-red-800 flex items-center justify-center font-bold text-white text-sm">{item.author.charAt(0)}</div>
          <div>
            <p className="text-sm font-semibold text-textc">{item.author}</p>
            <p className="text-xs text-mutedc">{formatDate(item.publishedAt)}</p>
          </div>
        </div>

        {item.excerpt && (
          <p className="mt-8 text-xl text-textc font-medium leading-relaxed border-l-4 border-red-600 pl-5">{item.excerpt}</p>
        )}

        <div className="mt-8">{renderContent(item.content)}</div>

        <Comments slug={item.slug} />

        {/* Divider to next story */}
        <div className="my-16 flex items-center gap-4">
          <div className="h-px flex-1 bg-borderc" />
          <span className="text-[10px] font-black uppercase tracking-widest text-mutedc">Next Story</span>
          <div className="h-px flex-1 bg-borderc" />
        </div>
      </div>
    </article>
  );
}

export default function InfiniteFeed({ initialSlug }: { initialSlug: string }) {
  const [revealed, setRevealed] = useState<NewsItem[]>([]);
  const [queue, setQueue] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const initialSlugRef = useRef(initialSlug);

  // Fetch full article list once, then feed one by one
  const bootstrap = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/news?limit=30`);
      const data = await res.json();
      const all: NewsItem[] = data.news || [];
      const startIdx = all.findIndex((n) => n.slug === initialSlugRef.current);
      // Start feeding from the article right after the current one
      const rest = startIdx >= 0 ? all.slice(startIdx + 1) : all;
      setQueue(rest);
      setDone(rest.length === 0);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Reveal next article when sentinel enters viewport
  useEffect(() => {
    if (done || queue.length === 0) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRevealed((r) => [...r, queue[0]]);
          setQueue((q) => {
            const next = q.slice(1);
            if (next.length === 0) setDone(true);
            return next;
          });
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [done, queue]);

  return (
    <div className="mt-0">
      {/* Revealed articles */}
      {revealed.map((item) => (
        <ArticleBlock key={item.id || item.slug} item={item} />
      ))}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-borderc border-t-red-500 rounded-full animate-spin" />
          <p className="text-sm text-mutedc">Loading stories...</p>
        </div>
      )}

      {/* Sentinel: when this enters viewport, next article gets revealed */}
      {!done && queue.length > 0 && (
        <div ref={sentinelRef} className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-7 h-7 border-2 border-borderc border-t-red-500 rounded-full animate-spin" />
          <p className="text-xs text-mutedc uppercase tracking-widest font-bold">Loading next story...</p>
        </div>
      )}

      {done && revealed.length > 0 && (
        <div className="text-center py-16">
          <p className="text-mutedc text-sm">— You&apos;ve reached the end of the feed —</p>
        </div>
      )}
    </div>
  );
}
