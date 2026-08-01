"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/app/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    const key = localStorage.getItem("admin_key");
    setApiKey(key);
    setChecking(false);
  }, []);

  // Login page renders standalone (no sidebar, no auth check)
  if (isLogin) {
    return <div className="min-h-screen bg-surface">{children}</div>;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-borderc border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <h1 className="text-2xl font-black text-textc mb-2">Admin Access Required</h1>
          <p className="text-mutedc mb-4">Please log in first.</p>
          <a href="/admin/login" className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-lg transition inline-block">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar apiKey={apiKey} />
      <main className="ml-60 transition-all duration-300">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
