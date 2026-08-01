"use client";

import { useEffect, useState } from "react";
import { API_URL, type NewsItem } from "@/lib/api";

export default function BreakingTicker() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=8`)
      .then((r) => r.json())
      .then((d) => setItems(d.news || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setOffset((o) => (o + 1) % items.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="bg-red-600 text-white overflow-hidden h-8 flex items-center">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-3 w-full">
        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest bg-white text-red-600 px-2 py-0.5 rounded">
          Breaking
        </span>
        <div className="relative flex-1 overflow-hidden h-6">
          <div className="flex items-center gap-8 whitespace-nowrap transition-transform duration-500" style={{ transform: `translateX(-${offset * 33}%)` }}>
            {items.map((item, i) => (
              <span key={i} className="text-sm font-medium opacity-90 shrink-0">
                {item.title}
                <span className="mx-6 opacity-30">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
