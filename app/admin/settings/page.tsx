"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface Settings {
  reddit: {
    subreddits: string[];
    model: string;
    intervalMinutes: number;
    enabled: boolean;
    postsPerSubreddit: number;
    minUps: number;
    maxAgeHours: number;
  };
}

const inputCls = "w-full bg-surface2 border border-borderc rounded-lg px-3 py-2 text-sm text-textc placeholder-mutedc focus:outline-none focus:border-red-500 transition";
const labelCls = "block text-xs font-bold uppercase tracking-wide text-mutedc mb-1.5";

export default function SettingsPage({ apiKey }: { apiKey: string }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [newSub, setNewSub] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const [settingsRes, modelsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/settings`, { headers: { "x-admin-key": apiKey } }),
        fetch(`${API_URL}/api/admin/models`, { headers: { "x-admin-key": apiKey } }),
      ]);
      const settingsData = await settingsRes.json();
      const modelsData = await modelsRes.json();
      if (settingsData.settings) setSettings(settingsData.settings);
      if (modelsData.models) setModels(modelsData.models);
    } catch {} finally { setLoading(false); }
  }, [apiKey]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!settings) return;
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-key": apiKey },
        body: JSON.stringify(settings),
      });
      if (res.ok) setMsg({ type: "ok", text: "Settings saved successfully" });
    } catch { setMsg({ type: "err", text: "Failed to save" }); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-borderc border-t-red-500 rounded-full animate-spin" /></div>;
  if (!settings) return <div className="text-mutedc py-24 text-center">Failed to load settings</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-textc">Settings</h1>
          <p className="text-mutedc text-sm mt-1">Configure your TestNews platform</p>
        </div>
        <button onClick={save} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-lg transition">Save Settings</button>
      </div>

      {msg && <p className={`text-sm rounded-lg px-4 py-3 border ${msg.type === "ok" ? "text-emerald-400 border-emerald-800 bg-emerald-950/30" : "text-red-400 border-red-800 bg-red-950/30"}`}>{msg.text}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="rounded-xl border border-borderc bg-surface2/40 p-6 space-y-5">
          <h2 className="font-bold text-textc text-lg">General</h2>
          <div className="flex items-center justify-between p-3 rounded-lg border border-borderc">
            <div>
              <p className="text-sm font-medium text-textc">Reddit Bot</p>
              <p className="text-xs text-mutedc">Auto-fetch and rewrite articles</p>
            </div>
            <button onClick={() => setSettings({ ...settings, reddit: { ...settings.reddit, enabled: !settings.reddit.enabled } })}
              className={`w-12 h-6 rounded-full transition ${settings.reddit.enabled ? "bg-red-600" : "bg-borderc"}`}>
              <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${settings.reddit.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div>
            <label className={labelCls}>AI Model</label>
            <select className={inputCls} value={settings.reddit.model} onChange={e => setSettings({ ...settings, reddit: { ...settings.reddit, model: e.target.value } })}>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Fetch Settings */}
        <div className="rounded-xl border border-borderc bg-surface2/40 p-6 space-y-5">
          <h2 className="font-bold text-textc text-lg">Fetch Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Interval (minutes)</label>
              <input type="number" className={inputCls} value={settings.reddit.intervalMinutes} onChange={e => setSettings({ ...settings, reddit: { ...settings.reddit, intervalMinutes: +e.target.value } })} min={10} />
            </div>
            <div>
              <label className={labelCls}>Posts per Subreddit</label>
              <input type="number" className={inputCls} value={settings.reddit.postsPerSubreddit} onChange={e => setSettings({ ...settings, reddit: { ...settings.reddit, postsPerSubreddit: +e.target.value } })} min={1} max={25} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Minimum Upvotes</label>
              <input type="number" className={inputCls} value={settings.reddit.minUps} onChange={e => setSettings({ ...settings, reddit: { ...settings.reddit, minUps: +e.target.value } })} min={0} />
            </div>
            <div>
              <label className={labelCls}>Max Post Age (hours)</label>
              <input type="number" className={inputCls} value={settings.reddit.maxAgeHours} onChange={e => setSettings({ ...settings, reddit: { ...settings.reddit, maxAgeHours: +e.target.value } })} min={1} />
            </div>
          </div>
        </div>

        {/* Subreddits */}
        <div className="rounded-xl border border-borderc bg-surface2/40 p-6 lg:col-span-2">
          <h2 className="font-bold text-textc text-lg mb-4">Subreddits ({settings.reddit.subreddits.length})</h2>
          <div className="flex gap-2 mb-4">
            <input className={inputCls} value={newSub} onChange={e => setNewSub(e.target.value)} placeholder="Add subreddit..." onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const s = newSub.trim(); if (s && !settings.reddit.subreddits.includes(s)) { setSettings({ ...settings, reddit: { ...settings.reddit, subreddits: [...settings.reddit.subreddits, s] } }); setNewSub(""); } } }} />
            <button onClick={() => { const s = newSub.trim(); if (s && !settings.reddit.subreddits.includes(s)) { setSettings({ ...settings, reddit: { ...settings.reddit, subreddits: [...settings.reddit.subreddits, s] } }); setNewSub(""); } }} className="px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg shrink-0">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.reddit.subreddits.map(sub => (
              <span key={sub} className="inline-flex items-center gap-1.5 text-sm font-medium text-mutedc bg-surface border border-borderc rounded-full pl-3 pr-1.5 py-1.5">
                r/{sub}
                <button onClick={() => setSettings({ ...settings, reddit: { ...settings.reddit, subreddits: settings.reddit.subreddits.filter(s => s !== sub) } })} className="text-red-400 hover:text-red-300 ml-1 w-5 h-5 rounded-full hover:bg-red-950 flex items-center justify-center text-xs">×</button>
              </span>
            ))}
          </div>
          {settings.reddit.subreddits.length === 0 && <p className="text-sm text-mutedc">No subreddits configured</p>}
        </div>
      </div>
    </div>
  );
}
