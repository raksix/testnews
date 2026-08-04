"use client";

import { useEffect, useState } from "react";
import { API_URL, type NewsItem } from "@/lib/api";
import Link from "next/link";

export default function MostRead() {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=5`)
      .then((r) => r.json())
      .then((d) => setItems(d.news?.slice(0, 5) || []))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-borderc bg-surface2/40 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-5 bg-brand rounded-full" />
        <h3 className="text-sm font-black uppercase tracking-widest text-textc">Most Read</h3>
      </div>
      <div className="space-y-0 divide-y divide-borderc">
        {items.map((item, i) => (
          <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="flex items-start gap-3 py-3 group">
            <span className="text-2xl font-black text-red-600/30 group-hover:text-brand transition w-7 shrink-0 leading-none pt-0.5">
              {i + 1}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-brand">{item.category}</span>
              <h4 className="text-sm font-semibold text-textc group-hover:text-brand transition leading-snug">{item.title}</h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
