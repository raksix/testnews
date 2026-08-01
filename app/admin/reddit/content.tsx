"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface RedditSettings {
  subreddits: string[];
  model: string;
  intervalMinutes: number;
  enabled: boolean;
  postsPerSubreddit: number;
  minUps: number;
  maxAgeHours: number;
}

const DEFAULT_SETTINGS: RedditSettings = {
  subreddits: [],
  model: "oc/deepseek-v4-flash-free",
  intervalMinutes: 60,
  enabled: true,
  postsPerSubreddit: 3,
  minUps: 100,
  maxAgeHours: 24,
};

const inputCls =
  "w-full bg-surface2 border border-borderc rounded-lg px-3 py-2 text-sm text-textc placeholder-mutedc focus:outline-none focus:border-red-500 transition";
const labelCls = "block text-xs font-bold uppercase tracking-wide text-mutedc mb-1.5";

export default function RedditBotContent({ apiKey }: { apiKey: string }) {
  const [settings, setSettings] = useState<RedditSettings>(DEFAULT_SETTINGS);
  const [models, setModels] = useState<string[]>([]);
  const [newSub, setNewSub] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [fetchResult, setFetchResult] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        headers: { "x-admin-key": apiKey },
      });
      const data = await res.json();
      if (data.settings?.reddit) setSettings(data.settings.reddit);
    } catch {} finally { setLoading(false); }
  }, [apiKey]);

  const loadModels = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/models`, {
        headers: { "x-admin-key": apiKey },
      });
      const data = await res.json();
      if (data.models) setModels(data.models);
    } catch {}
  }, [apiKey]);

  const loadLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/reddit/logs`, {
        headers: { "x-admin-key": apiKey },
      });
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch {}
  }, [apiKey]);

  useEffect(() => { loadSettings(); loadModels(); loadLogs(); }, [loadSettings, loadModels, loadLogs]);

  const saveSettings = async () => {
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-key": apiKey },
        body: JSON.stringify({ reddit: settings }),
      });
      if (res.ok) setMsg({ type: "ok", text: "Settings saved" });
    } catch { setMsg({ type: "err", text: "Failed to save" }); }
  };

  const runFetch = async () => {
    setFetching(true);
    setFetchResult(null);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/reddit/fetch`, {
        method: "POST",
        headers: { "x-admin-key": apiKey },
      });
      const data = await res.json();
      if (data.result) {
        const r = data.result;
        setFetchResult(`Fetched: ${r.fetched} | Created: ${r.created} | Skipped: ${r.skipped} | Errors: ${r.errors.length}`);
        if (r.errors.length > 0) setFetchResult((s) => `${s}\n${r.errors.join("\n")}`);
        setMsg({ type: "ok", text: `Created ${r.created} articles from Reddit` });
      } else if (data.error) {
        setMsg({ type: "err", text: data.error });
      }
    } catch { setMsg({ type: "err", text: "Fetch failed" }); }
    finally { setFetching(false); }
  };

  const addSub = () => {
    const s = newSub.trim();
    if (s && !settings.subreddits.includes(s)) {
      setSettings({ ...settings, subreddits: [...settings.subreddits, s] });
      setNewSub("");
    }
  };
  const removeSub = (sub: string) => {
    setSettings({ ...settings, subreddits: settings.subreddits.filter((s) => s !== sub) });
  };

  if (loading) return <div className="py-12 text-center text-mutedc">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-textc">Reddit Bot</h2>
        <div className="flex gap-3">
          <button onClick={saveSettings} className="text-sm border border-borderc text-mutedc hover:text-textc px-4 py-2 rounded-lg transition">Save Settings</button>
          <button onClick={runFetch} disabled={fetching} className="text-sm bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg transition">
            {fetching ? "Fetching..." : "Fetch Now"}
          </button>
        </div>
      </div>

      {msg && (
        <p className={`text-sm rounded-lg px-4 py-3 border ${msg.type === "ok" ? "text-emerald-400 border-emerald-800 bg-emerald-950/30" : "text-red-400 border-red-800 bg-red-950/30"}`}>
          {msg.text}
        </p>
      )}

      {fetchResult && (
        <pre className="text-xs text-mutedc bg-surface2 border border-borderc rounded-lg p-4 whitespace-pre-wrap">{fetchResult}</pre>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Settings */}
        <div className="space-y-5 rounded-xl border border-borderc bg-surface2/40 p-6">
          <h3 className="font-bold text-textc">Bot Settings</h3>

          <div className="flex items-center justify-between">
            <label className="text-sm text-mutedc">Enabled</label>
            <button onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
              className={`w-11 h-6 rounded-full transition ${settings.enabled ? "bg-red-600" : "bg-borderc"}`}>
              <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${settings.enabled ? "translate-x-5.5 ml-0.5" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div><label className={labelCls}>AI Model</label>
            <select className={inputCls} value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })}>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select></div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Interval (min)</label><input type="number" className={inputCls} value={settings.intervalMinutes} onChange={(e) => setSettings({ ...settings, intervalMinutes: +e.target.value })} min={10} /></div>
            <div><label className={labelCls}>Posts/Sub</label><input type="number" className={inputCls} value={settings.postsPerSubreddit} onChange={(e) => setSettings({ ...settings, postsPerSubreddit: +e.target.value })} min={1} max={25} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Min Ups</label><input type="number" className={inputCls} value={settings.minUps} onChange={(e) => setSettings({ ...settings, minUps: +e.target.value })} min={0} /></div>
            <div><label className={labelCls}>Max Age (hours)</label><input type="number" className={inputCls} value={settings.maxAgeHours} onChange={(e) => setSettings({ ...settings, maxAgeHours: +e.target.value })} min={1} /></div>
          </div>
        </div>

        {/* Subreddits */}
        <div className="rounded-xl border border-borderc bg-surface2/40 p-6">
          <h3 className="font-bold text-textc mb-4">Subreddits ({settings.subreddits.length})</h3>
          <div className="flex gap-2 mb-4">
            <input className={inputCls} value={newSub} onChange={(e) => setNewSub(e.target.value)} placeholder="subreddit name..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSub())} />
            <button onClick={addSub} className="px-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg shrink-0">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto">
            {settings.subreddits.map((sub) => (
              <span key={sub} className="inline-flex items-center gap-1 text-xs font-medium text-mutedc bg-surface border border-borderc rounded-full pl-2.5 pr-1.5 py-1">
                r/{sub}
                <button onClick={() => removeSub(sub)} className="text-red-400 hover:text-red-300 ml-1 text-sm">×</button>
              </span>
            ))}
          </div>
          {settings.subreddits.length === 0 && <p className="text-xs text-mutedc mt-2">No subreddits configured</p>}
        </div>
      </div>

      {/* Logs */}
      <div className="rounded-xl border border-borderc bg-surface2/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-textc">Bot Logs</h3>
          <button onClick={loadLogs} className="text-xs border border-borderc text-mutedc hover:text-textc px-3 py-1.5 rounded-lg transition">Refresh</button>
        </div>
        <div className="bg-surface border border-borderc rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs text-mutedc space-y-1">
          {logs.length === 0 && <p>No logs yet</p>}
          {logs.map((line, i) => (
            <div key={i} className={line.startsWith("✅") ? "text-emerald-400" : line.startsWith("❌") ? "text-red-400" : ""}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
