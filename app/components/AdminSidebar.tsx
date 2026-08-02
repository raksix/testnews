"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Articles", href: "/admin/articles", icon: "📰" },
  { label: "Reddit Bot", href: "/admin/reddit", icon: "🤖" },
  { label: "Comments", href: "/admin/comments", icon: "💬" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminSidebar({ apiKey, mobileOpen, onClose }: { apiKey: string; mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const content = (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-borderc">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-sm">T</span>
            <span className="font-black text-textc text-sm">TestNews</span>
          </Link>
        )}
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="lg:hidden text-mutedc hover:text-textc text-lg px-1" aria-label="Close menu">✕</button>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block text-mutedc hover:text-textc text-lg">
            {collapsed ? "»" : "«"}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 space-y-1">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-red-600/10 text-red-500 border border-red-600/20"
                  : "text-mutedc hover:text-textc hover:bg-surface border border-transparent"
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-borderc">
        <a href="/" target="_blank" className="flex items-center justify-center text-xs text-mutedc hover:text-red-500 transition border border-borderc rounded-lg py-2">
          View Site →
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:block fixed left-0 top-0 bottom-0 z-40 bg-surface2 border-r border-borderc transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface2 border-r border-borderc shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
