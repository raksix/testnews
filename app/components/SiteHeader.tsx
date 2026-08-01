"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import QuickSearch from "./QuickSearch";
import BreakingTicker from "./BreakingTicker";

const NAV = [
  "World", "Technology", "Business", "Sports", "Science", "Health", "Entertainment",
];

export default function SiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-borderc bg-surface/80 backdrop-blur">
      <BreakingTicker />
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-black text-white text-lg">T</span>
            <span className="text-xl font-black tracking-tight text-textc">Test<span className="text-red-500">News</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`} className="px-3 py-2 text-sm font-medium text-mutedc hover:text-textc hover:bg-surface2 rounded-md transition">{cat}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <QuickSearch />
            <ThemeToggle />
            <Link href="/admin" className="text-sm text-mutedc hover:text-textc border border-borderc hover:border-zinc-600 rounded-md px-3 py-1.5 transition">Admin</Link>
          </div>
        </div>
      </div>
      <nav className="md:hidden overflow-x-auto border-t border-borderc">
        <div className="flex gap-1 px-4 py-2">
          {NAV.map((cat) => (
            <Link key={cat} href={`/category/${cat.toLowerCase()}`} className="whitespace-nowrap px-3 py-1 text-xs font-medium text-mutedc hover:text-textc hover:bg-surface2 rounded-full transition">{cat}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-borderc mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-red-600 flex items-center justify-center font-black text-white text-xs">T</span>
          <span className="font-bold text-textc">TestNews</span>
        </div>
        <p className="text-sm text-mutedc">© {new Date().getFullYear()} TestNews. All rights reserved.</p>
      </div>
    </footer>
  );
}
