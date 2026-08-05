import type { Metadata } from "next";
import "./globals.css";
import SiteHeader, { SiteFooter } from "./components/SiteHeader";
import RouteProgress from "./components/RouteProgress";
import Tracker from "./components/Tracker";
export const metadata: Metadata = {
  metadataBase: new URL("https://newsluma.com"),
  title: {
    default: "Newsluma — Breaking News & Global Headlines",
    template: "%s | Newsluma",
  },
  description: "Newsluma delivers breaking news, world headlines, technology, business, sports and science coverage — updated around the clock.",
  keywords: ["breaking news", "world news", "headlines", "technology", "business", "sports", "science"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Newsluma — Breaking News & Global Headlines",
    description: "Breaking news, world headlines, technology, business, sports and science — updated around the clock.",
    url: "https://newsluma.com",
    siteName: "Newsluma",
    locale: "en_US",
    type: "website",
    images: [{ url: "/icon.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsluma — Breaking News & Global Headlines",
    description: "Breaking news and global headlines, updated around the clock.",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface text-textc antialiased min-h-screen flex flex-col transition-colors">
        <RouteProgress />
        <Tracker />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  name: "Newsluma",
                  url: "https://newsluma.com",
                  description: "Breaking news, world headlines, technology, business, sports and science coverage — updated around the clock.",
                  publisher: { "@type": "Organization", name: "Newsluma" },
                },
                {
                  "@type": "Organization",
                  name: "Newsluma",
                  url: "https://newsluma.com",
                  logo: "https://newsluma.com/icon.png",
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
