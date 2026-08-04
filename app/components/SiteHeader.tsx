"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { API_URL, type NewsItem } from "@/lib/api";

const NAV = [
  { label: "Gündem", href: "/" },
  { label: "Ekonomi", href: "/category/business" },
  { label: "Spor", href: "/category/sports" },
  { label: "Dünya", href: "/category/world" },
  { label: "Teknoloji", href: "/category/technology" },
  { label: "Sağlık", href: "/category/health" },
  { label: "Magazin", href: "/category/entertainment" },
  { label: "Yaşam", href: "/category/science" },
];

const MARKET = [
  { name: "Dolar", value: "34,28", change: "+0,42%", up: true },
  { name: "Euro", value: "37,15", change: "+0,31%", up: true },
  { name: "Gram Altın", value: "2.980", change: "-0,18%", up: false },
  { name: "Çeyrek", value: "4.870", change: "+0,25%", up: true },
  { name: "BIST 100", value: "10.842", change: "+1,12%", up: true },
  { name: "Bitcoin", value: "$68.240", change: "-0,84%", up: false },
];

const PRAYER = [
  { name: "İmsak", time: "04:12" },
  { name: "Güneş", time: "05:52" },
  { name: "Öğle", time: "13:16" },
  { name: "İkindi", time: "17:08" },
  { name: "Akşam", time: "20:28" },
  { name: "Yatsı", time: "21:58" },
];

function Arrow({ up }: { up: boolean }) {
  return (
    <svg viewBox="0 0 14 14" className="w-[13px] h-[13px] shrink-0">
      <path
        d={up
          ? "M9.2 3.51q-.14.04-.26.15-.12.11-.16.25-.06.2.03.4.08.19.25.29.1.04.3.05.22.02 1.01.02h1.05L7.08 8.2 5.78 6.91q-1.29-1.29-1.38-1.33-.09-.04-.22-.05-.12-.01-.22.03-.09.03-.37.3-.29.27-1.73 1.72-1.97 1.97-2.02 2.04-.08.2-.04.38.03.18.16.3.15.15.36.17.21.02.38-.09.07-.05 1.76-1.75l1.7-1.7 2.35 2.34q.25.23.35.29.07.04.18.04h.08q.1 0 .2-.05.13-.09.47-.44l3.66-3.64v2.24q.04.1.11.16.07.08.14.11.07.04.17.05.24.04.43-.09.2-.13.26-.37.01-.11 0-1.92V3.7q-.1-.2-.3-.3l-.08-.04-1.86-.01q-1.86 0-1.94.02z"
          : "M1.02 3.51q-.11.03-.22.12-.1.08-.16.19-.05.12-.05.26 0 .15.05.28.05.07 2.02 2.04 1.43 1.43 1.72 1.71.3.28.37.31.2.08.43 0 .07-.03.27-.22.2-.19 1.13-1.11l1.3-1.3 3.54 3.54h-1.04q-1.03 0-1.15.02-.25.03-.38.24-.13.2-.1.43.03.23.25.37l.01.01q.08.06.17.07.11.02.47.03l3.34-.02.08-.04q.2-.1.3-.3l.04-.1V7.5q.01-1.8 0-1.92-.04-.19-.19-.33-.16-.14-.37-.14-.2 0-.36.1-.14.1-.2.29-.03.05-.04.22v2.06l-2.03-2.02q-1.22-1.23-1.64-1.63-.42-.4-.47-.44-.09-.04-.24-.04h-.03q-.11 0-.2.04-.09.07-.36.3-.18.19-.84.85l-1.48 1.48-1.72-1.74q-1.15-1.14-1.46-1.44-.3-.29-.38-.32-.07-.03-.18-.04-.1-.01-.19 0z"}
        fill={up ? "#16A34A" : "#E23A3A"}
      />
    </svg>
  );
}

function MarketBar() {
  const today = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
  return (
    <div className="bg-band text-white">
      <div className="mx-auto max-w-[1320px] px-4 py-[9px] flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-[18px] shrink-0">
          <span className="flex items-center gap-1.5 bg-brand text-white text-[11px] font-bold tracking-[0.5px] px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />CANLI
          </span>
          {MARKET.map((m) => (
            <span key={m.name} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[12px] text-[#8A93A3]">{m.name}</span>
              <span className="text-[12px] font-semibold">{m.value}</span>
              <Arrow up={m.up} />
              <span className={`text-[11px] font-semibold ${m.up ? "text-[#16A34A]" : "text-[#E23A3A]"}`}>{m.change}</span>
            </span>
          ))}
        </div>
        <span className="text-[12px] text-[#8A93A3] whitespace-nowrap hidden lg:block">{today} • İstanbul 29°</span>
      </div>
    </div>
  );
}

function PrayerBar() {
  return (
    <div className="bg-surface2 border-b border-borderc hidden md:block">
      <div className="mx-auto max-w-[1320px] px-4 py-[7px] flex items-center justify-between">
        <span className="flex items-center gap-2 text-[12px] font-bold text-textc">
          <svg viewBox="0 0 14 14" className="w-[15px] h-[15px]">
            <path d="M6.57 1.19q-1.12.08-2.13.57-1.38.68-2.24 1.92-.85 1.25-1 2.79-.03.22-.02.68.02.45.04.68.17 1.08.68 1.99.5.9 1.3 1.6.56.48 1.23.82.67.33 1.39.47.35.07.55.09.2.02.65.02.37 0 .5-.01.15-.01.31-.03 1.96-.31 3.3-1.67.95-.95 1.38-2.17.26-.8.32-1.57.02-.43-.24-.69-.27-.26-.64-.26-.14 0-.25.04-.12.03-.28.13-.21.11-.27.14-.56.24-1.09.27-.85.02-1.6-.41-.75-.43-1.13-1.2-.17-.32-.24-.63-.07-.3-.07-.69 0-.42.09-.76.09-.34.32-.73.08-.16.11-.26.04-.11.04-.25 0-.14-.03-.25-.05-.24-.24-.41-.19-.18-.43-.22-.13-.02-.31 0zm4.91.01q-.24.09-.35.34-.03.05-.03.13-.01.06-.02.3v.35h-.28q-.32 0-.46.05-.14.04-.26.15-.2.2-.15.5.05.3.32.42.08.03.14.04.06 0 .32.02h.37v.3q0 .31.03.45.03.13.15.25.12.12.32.15.2.04.35-.05.08-.04.15-.12.07-.08.1-.15.04-.08.05-.14 0-.06.02-.33v-.36h.36q.26-.02.33-.02.06-.01.14-.04.08-.04.15-.11.08-.07.11-.14.04-.07.05-.18.04-.2-.05-.37-.09-.16-.28-.26-.08-.03-.14-.04-.06-.01-.33-.02h-.35v-.36q-.01-.26-.02-.32 0-.07-.04-.14-.03-.08-.13-.16-.09-.09-.18-.12-.09-.04-.2-.04-.13 0-.2.03zM6.16 4.46q-.03.05-.1.22-.42 1.19-.11 2.38.27 1.09 1.08 1.89.95.96 2.35 1.18.2.03.52.03.32 0 .53-.03.25-.04.56-.13.31-.08.5-.16l.07-.03v.04q.01.04-.06.31-.08.26-.12.42-.13.32-.33.68-.2.37-.41.63-.59.75-1.42 1.19-.82.45-1.75.56-.92.1-1.83-.18-1.04-.3-1.83-1.03-.79-.73-1.18-1.74-.31-.81-.31-1.71 0-.9.32-1.69.35-.9 1.03-1.58.68-.68 1.57-1.04.2-.09.49-.17.3-.08.4-.08.04 0 .04 0 0 0-.01.04z" fill="#D6122A" />
          </svg>
          İstanbul Namaz Vakitleri
        </span>
        <div className="flex items-center gap-[26px]">
          {PRAYER.map((p) => (
            <span key={p.name} className="flex flex-col items-center gap-[1px]">
              <span className="text-[10px] font-semibold tracking-[0.3px] text-mutedc">{p.name}</span>
              <span className="text-[13px] font-bold text-textc">{p.time}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

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
      {/* Market bar */}
      <MarketBar />

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
              Giriş Yap
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

      {/* Prayer bar */}
      <PrayerBar />

      {/* Breaking news bar */}
      <div className="bg-[#FFF4F4] border-b border-borderc">
        <div className="mx-auto max-w-[1320px] px-4 py-2.5 flex items-center gap-3.5 overflow-hidden">
          <span className="shrink-0 flex items-center gap-1.5 bg-brand text-white text-[12px] font-bold tracking-[0.5px] px-2.5 py-1 rounded">
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5">
              <path d="M7.74.6q-.17.03-.33.11-.1.07-2.82 2.87L1.77 6.56q-.35.37-.39.45l-.02.01q-.1.21-.12.45-.04.38.14.69.18.3.5.46l.05.03q.1.04.19.06.13.02.52.02l3.83.03-.57 1.79q-.58 1.8-.58 1.9-.04.25.1.5.14.25.38.37.39.19.77 0 .13-.07.32-.25l5.6-5.78q.22-.23.3-.42.09-.2.09-.48 0-.32-.17-.59-.17-.28-.46-.43l-.04-.02q-.1-.05-.2-.07-.14-.02-.52-.02l-3.84-.03.57-1.79q.58-1.8.58-1.89.04-.25-.1-.5-.14-.26-.4-.38-.25-.13-.5-.08zM6.82 3.8q-.38 1.2-.4 1.32-.02.2.02.4.05.2.16.37.07.1.21.22.13.12.24.17l.05.03q.11.06.2.07.15.01.53.03h3.82L9.1 8.96q-2.42 2.49-2.43 2.49 0 0 .38-1.21.38-1.21.4-1.33.02-.2-.03-.4-.05-.2-.15-.36-.06-.08-.16-.19-.1-.11-.19-.16-.17-.1-.38-.16-.07-.02-2.2-.03H2.28l2.43-2.5Q7.13 2.1 7.13 2.1q0 0-.38 1.22z" fill="currentColor" />
            </svg>
            SON DAKİKA
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
                return `${mins} dk önce`;
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
        <p className="text-sm text-mutedc">© {new Date().getFullYear()} TestNews. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}
