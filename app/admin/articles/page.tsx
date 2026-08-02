"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { API_URL, type NewsItem } from "@/lib/api";

const EMPTY: NewsItem = {
  slug: "", title: "", excerpt: "", content: "", category: "World",
  image: "", author: "News Desk", featured: false,
  publishedAt: new Date().toISOString().slice(0, 16),
};

const inputCls = "w-full bg-surface2 border border-borderc rounded-lg px-3 py-2 text-sm text-textc placeholder-mutedc focus:outline-none focus:border-red-500 transition";
const labelCls = "block text-xs font-bold uppercase tracking-wide text-mutedc mb-1.5";

export default function ArticlesPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<NewsItem>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { setApiKey(localStorage.getItem("admin_key")); }, []);

  const load = useCallback(async () => {
    if (!apiKey) return;
    const res = await fetch(`${API_URL}/api/admin/news`, {
      headers: { "x-admin-key": apiKey },
    });
    const data = await res.json();
    setNews(data.news || []);
  }, [apiKey]);

  useEffect(() => { if (apiKey) load(); }, [apiKey, load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    const payload = { ...form, publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(), featured: Boolean(form.featured) };
    const url = editingId ? `${API_URL}/api/admin/news/${editingId}` : `${API_URL}/api/admin/news`;
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": apiKey! },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) { setMsg({ type: "ok", text: editingId ? "Updated" : "Created" }); setForm(EMPTY); setEditingId(null); load(); }
    else { const d = await res.json().catch(() => ({})); setMsg({ type: "err", text: d.error || "Failed" }); }
  };

  const edit = (item: NewsItem) => { setEditingId((item as any)._id || item.id || null); setForm({ ...item, publishedAt: item.publishedAt?.slice(0, 16) || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async (id?: string) => { if (!id || !confirm("Delete?")) return; await fetch(`${API_URL}/api/admin/news/${id}`, { method: "DELETE", headers: { "x-admin-key": apiKey! } }); load(); };

  if (!apiKey) return null;

  const filtered = news.filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-textc">Articles</h1>
          <p className="text-mutedc text-sm mt-1">{news.length} total articles</p>
        </div>
      </div>

      {msg && <p className={`text-sm rounded-lg px-4 py-3 border ${msg.type === "ok" ? "text-emerald-400 border-emerald-800 bg-emerald-950/30" : "text-red-400 border-red-800 bg-red-950/30"}`}>{msg.text}</p>}

      {/* Edit form */}
      <form onSubmit={save} className="rounded-xl border border-borderc bg-surface2/40 p-6 space-y-4">
        <h2 className="font-bold text-textc">{editingId ? "✏️ Edit Article" : "➕ New Article"}</h2>
        <div><label className={labelCls}>Title *</label><input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Category</label><select className={inputCls} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className={labelCls}>Author</label><input className={inputCls} value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
        </div>
        <div><label className={labelCls}>Excerpt</label><textarea className={`${inputCls} h-16`} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} /></div>
        <div><label className={labelCls}>Content (Markdown)</label><textarea className={`${inputCls} h-40 font-mono text-xs`} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg transition">{loading ? "Saving..." : editingId ? "Update" : "Publish"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }} className="px-4 py-2.5 border border-borderc text-mutedc rounded-lg hover:bg-surface2 transition text-sm">Cancel</button>}
        </div>
      </form>

      {/* Article list */}
      <div className="rounded-xl border border-borderc bg-surface2/40 p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-bold text-textc">All Articles</h2>
          <input className="bg-surface border border-borderc rounded-lg px-3 py-1.5 text-sm text-textc placeholder-mutedc focus:outline-none focus:border-red-500 transition flex-1 max-w-xs" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.map(item => (
            <div key={item.id || item.slug} className="flex items-center gap-4 p-3 rounded-lg border border-borderc hover:border-zinc-600 transition">
              <div className="w-16 h-12 rounded bg-surface flex items-center justify-center text-zinc-700 text-xs shrink-0">
                <span className="font-black text-sm">{(item.category || "?").charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-red-500">{item.category}</span>
                  {item.featured && <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">★</span>}
                </div>
                <p className="text-sm font-semibold text-textc truncate">{item.title}</p>
                <p className="text-[10px] text-mutedc">{new Date(item.publishedAt).toLocaleDateString("en-US")} · {item.author}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => edit(item)} className="text-xs px-3 py-1.5 rounded border border-borderc text-mutedc hover:bg-surface2 transition">Edit</button>
                <button onClick={() => remove(item.id)} className="text-xs px-3 py-1.5 rounded border border-red-900 text-red-400 hover:bg-red-950 transition">Del</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
