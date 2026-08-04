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
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=8`)
      .then((r) => r.json())
      .then((d) => setBreaking(d.news || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (breaking.length === 0) return;
    const timer = setInterval(() => setOffset((o) => (o + 1) % breaking.length), 3500);
    return () => clearInterval(timer);
  }, [breaking.length]);

  if (pathname.startsWith("/admin")) return null;

  const active = pathname === "/" ? "/" : pathname;

  return (
    <header className="sticky top-0 z-50">
      {/* Main header */}
      <div className="bg-surface border-b border-borderc">
        <div className="mx-auto max-w-[1320px] px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-baseline shrink-0">
            <span className="text-[30px] font-extrabold tracking-[-1px] text-textc">TEST</span>
            <span className="text-[30px] font-extrabold tracking-[-1px] text-brand">NEWS</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-[22px]">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[15px] font-semibold transition whitespace-nowrap ${active === item.href ? "text-brand" : "text-textc hover:text-brand"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3.5 shrink-0">
            <Link href="/search" aria-label="Ara" className="hidden sm:block">
              <svg viewBox="0 0 14 14" className="w-5 h-5 text-textc">
                <path d="M6 .9q-.1.02-.3.06-.75.1-1.43.6-1.3.9-1.8 2.3-.24.77-.24 1.6 0 .5.06.74.06.27.16.65.25.98.78 1.86.53.88 1.26 1.53.53.47 1.06.78.54.31 1.2.57 1.38.5 2.87.38 1.5-.13 2.79-.86.16-.09.43-.27.27-.18.38-.27l.07-.07 1.44 1.44q1.45 1.43 1.56 1.5.11.06.31.06.2 0 .3-.04.12-.05.24-.17.13-.13.17-.24.05-.11.05-.31 0-.2-.07-.3-.06-.12-1.5-1.57L11.5 6.9l.07-.09q.08-.07.26-.33 1.07-1.6 1.16-3.51.09-1.9-.83-3.58A4.6 4.6 0 0 0 9.76-.78Q8.98-.98 8.14-1q-.56 0-.64.02zM6.78.9q.42-.05.94-.1.61-.03 1.03.12.54.16 1.02.42.96.5 1.67 1.4.7.88.98 1.94.09.36.12.64.02.28.02.66 0 .9-.25 1.69-.51 1.5-1.74 2.47-1.22.97-2.8 1.14-.26.01-.64 0-.38-.01-.63-.04-.7-.11-1.35-.4a4.4 4.4 0 0 1-1.22-.73q-.18-.16-.45-.44-.28-.28-.43-.48a3.9 3.9 0 0 1-.97-2.2 5 5 0 0 1 .07-1.17 3.7 3.7 0 0 1 .83-1.94 3.3 3.3 0 0 1 1.76-1.15q.9-.22 1.78.01.23.07.55.17.3.11.45.11l.34-.02z" fill="currentColor" />
              </svg>
            </Link>
            <Link href="/admin" className="bg-brand hover:bg-brand/90 text-white text-[14px] font-semibold px-3.5 py-2 rounded-lg transition whitespace-nowrap">
              Sign In
            </Link>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="lg:hidden border-t border-borderc overflow-x-auto scrollbar-hide">
          <div className="flex gap-5 px-4 py-2.5">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={`whitespace-nowrap text-[13px] font-semibold ${active === item.href ? "text-brand" : "text-mutedc"}`}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Breaking news bar */}
      <div className="bg-[#FFF4F4] border-b border-borderc">
        <div className="mx-auto max-w-[1320px] px-4 py-2.5 flex items-center gap-3.5 overflow-hidden">
          <span className="shrink-0 flex items-center gap-1.5 bg-brand text-white text-[12px] font-bold tracking-[0.5px] px-2.5 py-1 rounded">
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5">
              <path d="M7.74.6q-.17.03-.33.11-.1.07-2.82 2.87L1.77 6.56q-.35.37-.39.45l-.02.01q-.1.21-.12.45-.04.38.14.69.18.3.5.46l.05.03q.1.04.19.06.13.02.52.02l3.83.03-.57 1.79q-.58 1.8-.58 1.9-.04.25.1.5.14.25.38.37.39.19.77 0 .13-.07.32-.25l5.6-5.78q.22-.23.3-.42.09-.2.09-.48 0-.32-.17-.59-.17-.28-.46-.43l-.04-.02q-.1-.05-.2-.07-.14-.02-.52-.02l-3.84-.03.57-1.79q.58-1.8.58-1.89.04-.25-.1-.5-.14-.26-.4-.38-.25-.13-.5-.08zM6.82 3.8q-.38 1.2-.4 1.32-.02.2.02.4.05.2.16.37.07.1.21.22.13.12.24.17l.05.03q.11.06.2.07.15.01.53.03h3.82L9.1 8.96q-2.42 2.49-2.43 2.49 0 0 .38-1.21.38-1.21.4-1.33.02-.2-.03-.4-.05-.2-.15-.36-.06-.08-.16-.19-.1-.11-.19-.16-.17-.1-.38-.16-.07-.02-2.2-.03H2.28l2.43-2.5Q7.13 2.1 7.13 2.1q0 0-.38 1.22z" fill="currentColor" />
            </svg>
            BREAKING NEWS
          </span>
          <div className="relative flex-1 overflow-hidden h-6">
            {breaking.length > 0 && (
              <div className="flex items-center gap-10 whitespace-nowrap transition-transform duration-500" style={{ transform: `translateX(-${offset * 100}%)` }}>
                {breaking.map((item, i) => (
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
