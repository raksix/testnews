"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { API_URL, type NewsItem } from "@/lib/api";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Business", href: "/category/business" },
  { label: "Sports", href: "/category/sports" },
  { label: "World", href: "/category/world" },
  { label: "Technology", href: "/category/technology" },
  { label: "Health", href: "/category/health" },
  { label: "Entertainment", href: "/category/entertainment" },
  { label: "Science", href: "/category/science" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [breaking, setBreaking] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=8`)
      .then((r) => r.json())
      .then((d) => setBreaking(d.news || []))
      .catch(() => {});
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const isArticle = pathname.startsWith("/news/");
  const active = pathname === "/" ? "/" : pathname;

  return (
    <header className={isArticle ? "absolute top-0 left-0 right-0 z-50" : "sticky top-0 z-50"}>
      {/* Main header */}
      <div className={isArticle ? "border-b border-white/10" : "bg-surface border-b border-borderc"}>
        <div className="mx-auto max-w-[1320px] px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-baseline shrink-0">
            <span className={`text-[30px] font-extrabold tracking-[-1px] ${isArticle ? "text-white" : "text-textc"}`}>TEST</span>
            <span className="text-[30px] font-extrabold tracking-[-1px] text-brand">NEWS</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-[22px]">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[15px] font-semibold transition whitespace-nowrap ${
                  active === item.href
                    ? isArticle
                      ? "text-white"
                      : "text-brand"
                    : isArticle
                      ? "text-white/85 hover:text-white"
                      : "text-textc hover:text-brand"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3.5 shrink-0">
            <Link href="/search" aria-label="Search" className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-borderc hover:border-brand hover:text-brand transition">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Link>
            <Link href="/admin" className="bg-brand hover:bg-brand/90 text-white text-[14px] font-semibold px-3.5 py-2 rounded-lg transition whitespace-nowrap">
              Sign In
            </Link>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className={`lg:hidden border-t overflow-x-auto scrollbar-hide ${isArticle ? "border-white/10" : "border-borderc"}`}>
          <div className="flex gap-5 px-4 py-2.5">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={`whitespace-nowrap text-[13px] font-semibold ${active === item.href ? (isArticle ? "text-white" : "text-brand") : isArticle ? "text-white/70" : "text-mutedc"}`}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Breaking news bar */}
      <div className={isArticle ? "hidden" : "bg-[#FFF4F4] border-b border-borderc"}>
        <div className="mx-auto max-w-[1320px] px-4 py-2.5 flex items-center gap-3.5 overflow-hidden">
          <span className="shrink-0 flex items-center gap-1.5 bg-brand text-white text-[12px] font-bold tracking-[0.5px] px-2.5 py-1 rounded">
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5">
              <path d="M7.74.6q-.17.03-.33.11-.1.07-2.82 2.87L1.77 6.56q-.35.37-.39.45l-.02.01q-.1.21-.12.45-.04.38.14.69.18.3.5.46l.05.03q.1.04.19.06.13.02.52.02l3.83.03-.57 1.79q-.58 1.8-.58 1.9-.04.25.1.5.14.25.38.37.39.19.77 0 .13-.07.32-.25l5.6-5.78q.22-.23.3-.42.09-.2.09-.48 0-.32-.17-.59-.17-.28-.46-.43l-.04-.02q-.1-.05-.2-.07-.14-.02-.52-.02l-3.84-.03.57-1.79q.58-1.8.58-1.89.04-.25-.1-.5-.14-.26-.4-.38-.25-.13-.5-.08zM6.82 3.8q-.38 1.2-.4 1.32-.02.2.02.4.05.2.16.37.07.1.21.22.13.12.24.17l.05.03q.11.06.2.07.15.01.53.03h3.82L9.1 8.96q-2.42 2.49-2.43 2.49 0 0 .38-1.21.38-1.21.4-1.33.02-.2-.03-.4-.05-.2-.15-.36-.06-.08-.16-.19-.1-.11-.19-.16-.17-.1-.38-.16-.07-.02-2.2-.03H2.28l2.43-2.5Q7.13 2.1 7.13 2.1q0 0-.38 1.22z" fill="currentColor" />
            </svg>
            BREAKING NEWS
          </span>
          <div className="relative flex-1 overflow-hidden h-6">
            {breaking.length > 0 && (
              <div className="marquee flex items-center gap-12 whitespace-nowrap">
                {[...breaking, ...breaking].map((item, i) => (
                  <Link key={i} href={`/news/${item.slug}`} className="text-[14px] font-semibold text-textc hover:text-brand transition shrink-0">
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {breaking.length > 0 && (
            <span className="shrink-0 text-[12px] font-semibold text-brand hidden sm:block">
              {(() => {
                const mins = Math.max(1, Math.floor((Date.now() - new Date(breaking[0].publishedAt).getTime()) / 60000));
                return `${mins} min ago`;
              })()}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-borderc mt-16">
      <div className="mx-auto max-w-[1320px] px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-extrabold tracking-[-1px] text-textc">TEST<span className="text-brand">NEWS</span></span>
        </div>
        <p className="text-sm text-mutedc">© {new Date().getFullYear()} TestNews. All rights reserved.</p>
      </div>
    </footer>
  );
}
