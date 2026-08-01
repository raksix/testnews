"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AutoNext({
  nextSlug,
  nextTitle,
  nextExcerpt,
  nextCategory,
}: {
  nextSlug: string;
  nextTitle: string;
  nextExcerpt: string;
  nextCategory: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [triggered]);

  useEffect(() => {
    if (!triggered || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [triggered, countdown]);

  useEffect(() => {
    if (triggered && countdown === 0) {
      router.push(`/news/${nextSlug}`);
    }
  }, [triggered, countdown, nextSlug, router]);

  return (
    <div ref={ref} className="relative mt-12 mb-8">
      {/* Loading indicator at the very bottom */}
      {triggered && countdown > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-borderc shadow-2xl">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              {/* Spinning loader */}
              <div className="relative shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-borderc" />
                  <circle
                    cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className="text-red-500"
                    strokeDasharray="94"
                    strokeDashoffset={94 - (94 * (3 - countdown)) / 3}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-red-500">
                  {countdown}
                </span>
              </div>
              {/* Next article info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-0.5">
                  Up Next
                </p>
                <h4 className="font-bold text-textc text-sm leading-snug truncate">
                  {nextTitle}
                </h4>
                <p className="text-xs text-mutedc truncate mt-0.5">{nextExcerpt}</p>
              </div>
              {/* Cancel */}
              <button
                onClick={() => setTriggered(false)}
                className="shrink-0 text-xs text-mutedc hover:text-textc border border-borderc rounded-md px-2 py-1 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger zone — the slide-up card */}
      <Link
        href={`/news/${nextSlug}`}
        className={`group block rounded-2xl overflow-hidden border border-borderc transition-all duration-700 ${
          triggered
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-12"
        }`}
        onMouseEnter={() => !triggered && setTriggered(true)}
      >
        <div className="relative">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent z-10" />
          {/* Content */}
          <div className="relative p-8 pb-10 bg-gradient-to-br from-red-950/20 to-surface2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3 block">
              Continue Reading
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-textc group-hover:text-white leading-tight transition">
              {nextTitle}
            </h3>
            {nextExcerpt && (
              <p className="mt-3 text-sm text-mutedc line-clamp-2 max-w-xl">{nextExcerpt}</p>
            )}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xs font-bold uppercase text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
                {nextCategory}
              </span>
              <span className="text-xs text-mutedc">Tap to continue →</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
