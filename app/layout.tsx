import type { Metadata } from "next";
import "./globals.css";
import SiteHeader, { SiteFooter } from "./components/SiteHeader";
export const metadata: Metadata = {
  title: {
    default: "TestNews — Breaking News & Global Headlines",
    template: "%s | TestNews",
  },
  description: "TestNews delivers breaking news, world headlines, technology, business, sports and science coverage — updated around the clock.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface text-textc antialiased min-h-screen flex flex-col transition-colors">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
