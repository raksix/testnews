"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

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
  if (pathname.startsWith("/admin")) return null;

  const active = pathname === "/" ? "/" : pathname;

  return (
    <header className="sticky top-0 z-50">
      {/* Main header */}
      <div className="bg-surface border-b border-borderc">
        <div className="mx-auto max-w-[1320px] px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-baseline shrink-0">
            <span className="text-[30px] font-extrabold tracking-[-1px] text-textc">NEWS</span>
            <span className="text-[30px] font-extrabold tracking-[-1px] text-brand">LUMA</span>
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
          <span className="text-[22px] font-extrabold tracking-[-1px] text-textc">NEWS<span className="text-brand">LUMA</span></span>
        </div>
        <nav className="flex items-center gap-5 text-[13px] font-medium text-mutedc">
          <Link href="/privacy" className="hover:text-brand transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand transition">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-brand transition">Cookie Policy</Link>
        </nav>
        <p className="text-sm text-mutedc">© {new Date().getFullYear()} Newsluma. All rights reserved.</p>
      </div>
    </footer>
  );
}
