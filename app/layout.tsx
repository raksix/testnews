import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "TestNews — Breaking News & Global Headlines",
    template: "%s | TestNews",
  },
  description:
    "TestNews delivers breaking news, world headlines, technology, business, sports and science coverage — updated around the clock.",
};

const NAV = [
  "World",
  "Technology",
  "Business",
  "Sports",
  "Science",
  "Health",
  "Entertainment",
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-black text-zinc-100 antialiased min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-black text-white text-lg">
                  T
                </span>
                <span className="text-xl font-black tracking-tight">
                  Test<span className="text-red-500">News</span>
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {NAV.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${cat.toLowerCase()}`}
                    className="px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-md transition"
                  >
                    {cat}
                  </Link>
                ))}
              </nav>
              <Link
                href="/admin"
                className="text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-md px-3 py-1.5 transition"
              >
                Admin
              </Link>
            </div>
          </div>
          <nav className="md:hidden overflow-x-auto border-t border-zinc-800">
            <div className="flex gap-1 px-4 py-2">
              {NAV.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase()}`}
                  className="whitespace-nowrap px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-full transition"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-800 mt-16">
          <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-red-600 flex items-center justify-center font-black text-white text-xs">
                T
              </span>
              <span className="font-bold">TestNews</span>
            </div>
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} TestNews. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
