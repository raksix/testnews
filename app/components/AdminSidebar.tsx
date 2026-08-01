"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/app/components/ThemeToggle";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "All Articles", href: "/admin/articles", icon: "📰" },
  { label: "Reddit Bot", href: "/admin/reddit", icon: "🤖" },
  { label: "Comments", href: "/admin/comments", icon: "💬" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminSidebar({ apiKey }: { apiKey: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`fixed left-0 top-0 bottom-0 z-40 bg-surface2 border-r border-borderc transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-borderc">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-sm">T</span>
            <span className="font-black text-textc text-sm">TestNews</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-mutedc hover:text-textc text-lg">
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 space-y-1">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-red-600/10 text-red-500 border border-red-600/20"
                  : "text-mutedc hover:text-textc hover:bg-surface border border-transparent"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-borderc">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!collapsed && (
            <a href="/" target="_blank" className="text-xs text-mutedc hover:text-red-500 transition">
              View Site →
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
