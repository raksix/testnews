"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CategorySlider({ items }: { items: NewsItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [paused, count]);

  if (count === 0) return null;

  const prev = () => setIndex((index - 1 + count) % count);
  const next = () => setIndex((index + 1) % count);

  return (
    <div
      className="relative rounded-xl overflow-hidden mb-10 select-none"
      onMouseEnter={() => { setPaused(true); setHover(true); }}
      onMouseLeave={() => { setPaused(false); setHover(false); }}
    >
      {/* Slaytlar */}
      <div className="relative min-h-[340px] md:min-h-[480px]">
        {items.map((item, i) => (
          <Link
            key={item.id || item.slug}
            href={`/news/${item.slug}`}
            className={`absolute inset-0 block transition-opacity duration-700 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {item.image ? (
              <img src={imgUrl(item.image)} alt={item.title} fetchPriority="high" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand/20 to-surface2" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-[34px] md:px-[50px] py-6 md:py-10 max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-brand text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded tracking-wider">{item.category}</span>
                <span className="text-white/60 text-xs">{formatDate(item.publishedAt)}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">{item.title}</h2>
              {item.excerpt && <p className="mt-3 text-white/60 text-sm md:text-base line-clamp-2 hidden md:block">{item.excerpt}</p>}
              <p className="mt-3 text-white/40 text-xs">By {item.author}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Oklar */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-brand text-white flex items-center justify-center transition-opacity duration-300 ${hover ? "opacity-100" : "opacity-0"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-brand text-white flex items-center justify-center transition-opacity duration-300 ${hover ? "opacity-100" : "opacity-0"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Noktalar */}
      <div className={`absolute bottom-4 right-4 z-20 flex gap-1.5 transition-opacity duration-300 ${hover ? "opacity-100" : "opacity-0"}`}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-brand" : "w-1.5 bg-white/50 hover:bg-white"}`}
          />
        ))}
      </div>
    </div>
  );
}
