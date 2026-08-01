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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}else{document.documentElement.classList.remove('light');document.documentElement.classList.add('dark')}}catch(e){}` }} />
      </head>
      <body className="bg-surface text-textc antialiased min-h-screen flex flex-col transition-colors">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
