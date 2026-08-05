"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import AdminAnalytics from "./AdminAnalytics";

interface Stats {
  total: number;
  reddit: number;
  today: number;
  comments: number;
  byCategory: { category: string; count: number }[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "bg-blue-500",
  World: "bg-green-500",
  Business: "bg-yellow-500",
  Sports: "bg-orange-500",
  Science: "bg-purple-500",
  Health: "bg-pink-500",
  Entertainment: "bg-red-500",
};

export default function AdminDashboard({ apiKey }: { apiKey: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { "x-admin-key": apiKey },
      });
      const data = await res.json();
      setStats(data);
    } catch {} finally { setLoading(false); }
  }, [apiKey]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-borderc border-t-red-500 rounded-full animate-spin" /></div>;
  if (!stats) return <div className="text-mutedc py-24 text-center">Failed to load stats</div>;

  const maxCategory = Math.max(...stats.byCategory.map(c => c.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-textc">Dashboard</h1>
        <p className="text-mutedc text-sm mt-1">Overview of your news platform</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Articles" value={stats.total} icon="📰" color="from-red-500/20 to-red-600/5" />
        <StatCard label="Reddit Sourced" value={stats.reddit} icon="🤖" color="from-orange-500/20 to-orange-600/5" />
        <StatCard label="Published Today" value={stats.today} icon="📅" color="from-blue-500/20 to-blue-600/5" />
        <StatCard label="Comments" value={stats.comments} icon="💬" color="from-green-500/20 to-green-600/5" />
      </div>

      {/* Category breakdown */}
      <div className="rounded-xl border border-borderc bg-surface2/40 p-6">
        <h2 className="text-lg font-black text-textc mb-6">Articles by Category</h2>
        <div className="space-y-4">
          {stats.byCategory
            .sort((a, b) => b.count - a.count)
            .map((cat) => (
              <div key={cat.category} className="flex items-center gap-4">
                <span className="text-sm font-medium text-textc w-24 shrink-0">{cat.category}</span>
                <div className="flex-1 h-8 bg-surface rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg ${CATEGORY_COLORS[cat.category] || "bg-gray-500"} transition-all duration-500`}
                    style={{ width: `${(cat.count / maxCategory) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-textc w-10 text-right">{cat.count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <a href="/admin/articles" className="group rounded-xl border border-borderc bg-surface2/40 p-6 hover:border-red-500/30 transition">
          <div className="text-3xl mb-3">📝</div>
          <h3 className="font-bold text-textc group-hover:text-red-500 transition">Manage Articles</h3>
          <p className="text-sm text-mutedc mt-1">Create, edit, or delete articles</p>
        </a>
        <a href="/admin/reddit" className="group rounded-xl border border-borderc bg-surface2/40 p-6 hover:border-orange-500/30 transition">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="font-bold text-textc group-hover:text-orange-500 transition">Reddit Bot</h3>
          <p className="text-sm text-mutedc mt-1">Configure auto-fetch and AI settings</p>
        </a>
        <a href="/" target="_blank" className="group rounded-xl border border-borderc bg-surface2/40 p-6 hover:border-blue-500/30 transition">
          <div className="text-3xl mb-3">🌐</div>
          <h3 className="font-bold text-textc group-hover:text-blue-500 transition">View Live Site</h3>
          <p className="text-sm text-mutedc mt-1">Open testnews.fermag.com.tr</p>
        </a>
      </div>

      {/* Detaylı istatistikler */}
      <AdminAnalytics apiKey={apiKey} />
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className={`rounded-xl border border-borderc bg-gradient-to-br ${color} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-black text-textc">{value.toLocaleString()}</span>
      </div>
      <p className="text-sm font-medium text-mutedc">{label}</p>
    </div>
  );
}
