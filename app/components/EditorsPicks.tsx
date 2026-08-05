"use client";

import { useEffect, useState } from "react";
import { API_URL, imgUrl, type NewsItem } from "@/lib/api";
import Link from "next/link";

export default function EditorsPicks() {
  const [picks, setPicks] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=4`)
      .then((r) => r.json())
      .then((d) => {
        const news = d.news || [];
        // Editor's picks: take every 3rd article for variety
        setPicks([news[0], news[3], news[7], news[11]].filter(Boolean));
      })
      .catch(() => {});
  }, []);

  if (picks.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
        <h2 className="text-xl font-black text-textc tracking-tight">
          Editor&apos;s <span className="text-yellow-500">Picks</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {picks.map((item, i) => (
          <Link
            key={item.id || item.slug}
            href={`/news/${item.slug}`}
            className="group relative block rounded-xl overflow-hidden min-h-[180px] bg-gradient-to-br from-surface2 to-borderc"
          >
            {item.image && (
              <img src={imgUrl(item.image)} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition duration-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
            <div className="absolute bottom-0 p-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                ★ Editor&apos;s Pick
              </span>
              <h3 className="mt-2 font-bold text-white leading-snug text-sm group-hover:text-yellow-300 transition">{item.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
