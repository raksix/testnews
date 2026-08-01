"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-lg border border-borderc flex items-center justify-center hover:bg-surface2 transition"
        aria-label="Search"
      >
        <svg className="w-4 h-4 text-mutedc" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 animate-in slide-in-from-top-4 duration-200">
            <form onSubmit={search} className="relative">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full bg-surface border-2 border-red-500 rounded-2xl px-6 py-4 text-lg text-textc placeholder-mutedc focus:outline-none shadow-2xl"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-4 py-2 rounded-xl transition"
              >
                Search
              </button>
            </form>
            <div className="mt-2 text-center">
              <button onClick={() => setOpen(false)} className="text-xs text-mutedc hover:text-textc transition">Press ESC to close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
