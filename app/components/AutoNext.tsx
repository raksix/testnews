"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AutoNext({
  nextSlug,
  nextTitle,
}: {
  nextSlug: string;
  nextTitle: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
          setTimeout(() => router.push(`/news/${nextSlug}`), 2000);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextSlug, triggered, router]);

  return (
    <div ref={ref} className="mt-12 border-t border-borderc pt-8">
      <p className="text-xs font-bold uppercase tracking-wide text-mutedc mb-3">
        {triggered ? "Loading next article..." : "Up next"}
      </p>
      <Link
        href={`/news/${nextSlug}`}
        className="group block p-6 rounded-xl border border-borderc bg-surface2/40 hover:border-zinc-600 transition"
      >
        <span className="text-xs font-bold uppercase text-red-500">Next Article</span>
        <h3 className="mt-2 text-xl font-bold text-textc group-hover:text-white leading-snug">
          {nextTitle}
        </h3>
        {triggered && (
          <div className="mt-3 w-full h-1 rounded-full bg-surface2 overflow-hidden">
            <div className="h-full bg-red-600 animate-[shrink_2s_linear_forwards]" style={{ animation: "shrink 2s linear forwards" }} />
          </div>
        )}
      </Link>
      <style>{`@keyframes shrink { from { width: 100% } to { width: 0% } }`}</style>
    </div>
  );
}
