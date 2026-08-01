"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface TrendingTopic {
  tag: string;
  count: number;
}

const TOPICS: TrendingTopic[] = [
  { tag: "Quantum Computing", count: 2847 },
  { tag: "Climate Finance", count: 2103 },
  { tag: "AI Healthcare", count: 1956 },
  { tag: "Space Tourism", count: 1654 },
  { tag: "Coral Recovery", count: 1432 },
  { tag: "Fusion Energy", count: 1289 },
  { tag: "Cybersecurity", count: 1156 },
  { tag: "Crypto Regulation", count: 987 },
  { tag: "Olympics 2028", count: 876 },
  { tag: "Loneliness Crisis", count: 743 },
];

export default function TrendingTopics() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);

  useEffect(() => {
    setTopics(TOPICS);
  }, []);

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-5 bg-purple-500 rounded-full" />
        <h3 className="text-sm font-black uppercase tracking-widest text-textc">Trending Topics</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic.tag}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-mutedc bg-surface2 border border-borderc rounded-full px-3 py-1.5 hover:border-purple-500/50 hover:text-purple-400 transition cursor-pointer"
          >
            <span className="text-purple-500">#</span>
            {topic.tag}
            <span className="text-[10px] text-borderc">({topic.count})</span>
          </span>
        ))}
      </div>
    </section>
  );
}
