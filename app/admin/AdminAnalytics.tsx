"use client";
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface Analytics {
  total: number;
  today: number;
  online: number;
  uniqueVisitors: number;
  daily: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
  referrers: { name: string; count: number }[];
  devices: { name: string; count: number }[];
  browsers: { name: string; count: number }[];
  countries: { name: string; count: number }[];
  recent: { path: string; country: string; device: string; browser: string; referrer: string; createdAt: string }[];
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${fmtTime(iso)}`;
}
function shortPath(p: string) {
  if (p === "/") return "/ (Home)";
  return p.length > 42 ? p.slice(0, 42) + "…" : p;
}

function Bar({ name, count, max, color = "bg-red-500" }: { name: string; count: number; max: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 truncate text-[13px] text-textc/90 shrink-0">{name}</span>
      <div className="flex-1 h-2 bg-borderc/50 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }} />
      </div>
      <span className="w-10 text-right text-[13px] font-bold text-textc shrink-0">{count}</span>
    </div>
  );
}

export default function AdminAnalytics({ apiKey }: { apiKey: string }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/analytics`, { headers: { "x-admin-key": apiKey } });
      if (res.ok) setData(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000); // live-ish online counter
    return () => clearInterval(iv);
  }, [load]);

  if (loading) return <div className="py-16 text-center text-mutedc text-sm">Loading analytics…</div>;
  if (!data) return <div className="py-16 text-center text-mutedc text-sm">Failed to load analytics</div>;

  const maxDaily = Math.max(...data.daily.map((d) => d.count), 1);
  const maxPage = Math.max(...data.topPages.map((p) => p.count), 1);
  const maxRef = Math.max(...data.referrers.map((r) => r.count), 1);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[4px] h-[22px] bg-brand rounded-[2px]" />
          <h2 className="text-xl font-extrabold text-textc tracking-tight">Site Analytics</h2>
        </div>
        <span className="flex items-center gap-2 text-xs font-semibold text-green-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live · refreshes every 30s
        </span>
      </div>

      {/* Live cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-borderc bg-surface2/40 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-mutedc">Online Now</div>
          <div className="text-3xl font-black text-green-500 mt-1">{data.online}</div>
          <div className="text-[11px] text-mutedc mt-0.5">active last 5 min</div>
        </div>
        <div className="rounded-xl border border-borderc bg-surface2/40 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-mutedc">Views Today</div>
          <div className="text-3xl font-black text-textc mt-1">{data.today}</div>
          <div className="text-[11px] text-mutedc mt-0.5">page views</div>
        </div>
        <div className="rounded-xl border border-borderc bg-surface2/40 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-mutedc">Total Views</div>
          <div className="text-3xl font-black text-textc mt-1">{data.total}</div>
          <div className="text-[11px] text-mutedc mt-0.5">all time</div>
        </div>
        <div className="rounded-xl border border-borderc bg-surface2/40 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-mutedc">Unique Visitors</div>
          <div className="text-3xl font-black text-textc mt-1">{data.uniqueVisitors}</div>
          <div className="text-[11px] text-mutedc mt-0.5">sessions</div>
        </div>
      </div>

      {/* Last 7 days */}
      <div className="rounded-xl border border-borderc bg-surface2/40 p-5">
        <h3 className="text-sm font-bold text-textc mb-4">Last 7 Days</h3>
        <div className="flex items-end gap-2 h-32">
          {data.daily.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-bold text-textc">{d.count}</span>
              <div className="w-full rounded-t-md bg-red-500/80 hover:bg-red-500 transition" style={{ height: `${Math.max((d.count / maxDaily) * 90, 4)}%` }} />
              <span className="text-[10px] text-mutedc truncate">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="rounded-xl border border-borderc bg-surface2/40 p-5">
          <h3 className="text-sm font-bold text-textc mb-4">Most Viewed Pages</h3>
          <div className="space-y-2.5">
            {data.topPages.map((p) => <Bar key={p.path} name={shortPath(p.path)} count={p.count} max={maxPage} />)}
          </div>
        </div>
        {/* Referrers */}
        <div className="rounded-xl border border-borderc bg-surface2/40 p-5">
          <h3 className="text-sm font-bold text-textc mb-4">Traffic Sources</h3>
          <div className="space-y-2.5">
            {data.referrers.length === 0 && <div className="text-[13px] text-mutedc">No external traffic yet</div>}
            {data.referrers.map((r) => <Bar key={r.name} name={r.name} count={r.count} max={maxRef} color="bg-blue-500" />)}
          </div>
        </div>
        {/* Devices */}
        <div className="rounded-xl border border-borderc bg-surface2/40 p-5">
          <h3 className="text-sm font-bold text-textc mb-4">Devices</h3>
          <div className="grid grid-cols-3 gap-3">
            {data.devices.map((d) => (
              <div key={d.name} className="text-center rounded-lg bg-borderc/30 p-3">
                <div className="text-xl">{d.name === "Mobile" ? "📱" : d.name === "Tablet" ? "📲" : "💻"}</div>
                <div className="text-lg font-black text-textc mt-1">{d.count}</div>
                <div className="text-[11px] text-mutedc">{d.name}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Browsers */}
        <div className="rounded-xl border border-borderc bg-surface2/40 p-5">
          <h3 className="text-sm font-bold text-textc mb-4">Browsers</h3>
          <div className="space-y-2.5">
            {data.browsers.map((b) => <Bar key={b.name} name={b.name} count={b.count} max={Math.max(...data.browsers.map((x) => x.count), 1)} color="bg-purple-500" />)}
          </div>
        </div>
      </div>

      {/* Countries */}
      <div className="rounded-xl border border-borderc bg-surface2/40 p-5">
        <h3 className="text-sm font-bold text-textc mb-4">Countries</h3>
        {data.countries.length === 0 ? (
          <div className="text-[13px] text-mutedc">No geo data yet (visits will appear as they come in)</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {data.countries.map((c) => (
              <div key={c.name} className="text-center rounded-lg bg-borderc/30 p-3">
                <div className="text-xl">🌍</div>
                <div className="text-lg font-black text-textc mt-1">{c.count}</div>
                <div className="text-[11px] text-mutedc">{c.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent visits */}
      <div className="rounded-xl border border-borderc bg-surface2/40 p-5 overflow-x-auto">
        <h3 className="text-sm font-bold text-textc mb-4">Recent Visits</h3>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-mutedc border-b border-borderc">
              <th className="py-2 pr-4">Page</th>
              <th className="py-2 pr-4">Country</th>
              <th className="py-2 pr-4">Device</th>
              <th className="py-2 pr-4">Browser</th>
              <th className="py-2 pr-4">Source</th>
              <th className="py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {data.recent.map((r, i) => (
              <tr key={i} className="border-b border-borderc/50 last:border-0">
                <td className="py-2 pr-4 text-textc font-medium max-w-[220px] truncate">{shortPath(r.path)}</td>
                <td className="py-2 pr-4 text-mutedc">{r.country}</td>
                <td className="py-2 pr-4 text-mutedc">{r.device}</td>
                <td className="py-2 pr-4 text-mutedc">{r.browser}</td>
                <td className="py-2 pr-4 text-mutedc">{r.referrer}</td>
                <td className="py-2 text-mutedc whitespace-nowrap">{fmtDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
