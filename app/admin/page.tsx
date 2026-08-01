"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { API_URL, type NewsItem } from "@/lib/api";

const EMPTY: NewsItem = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  category: "World",
  image: "",
  author: "News Desk",
  featured: false,
  publishedAt: new Date().toISOString().slice(0, 16),
};

const inputCls =
  "w-full bg-surface2 border border-borderc rounded-lg px-3 py-2 text-sm text-textc placeholder-mutedc focus:outline-none focus:border-red-500 transition";
const labelCls = "block text-xs font-bold uppercase tracking-wide text-mutedc mb-1.5";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<NewsItem>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/news?limit=50`);
    const data = await res.json();
    setNews(data.news || []);
  }, []);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (res.ok) {
      localStorage.setItem("admin_key", key);
      setAuthed(true); setMsg(null);
    } else { setMsg({ type: "err", text: "Invalid admin key" }); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const payload = { ...form, publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(), featured: Boolean(form.featured) };
    const url = editingId ? `${API_URL}/api/admin/news/${editingId}` : `${API_URL}/api/admin/news`;
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      setMsg({ type: "ok", text: editingId ? "Article updated" : "Article created" });
      setForm(EMPTY); setEditingId(null); load();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg({ type: "err", text: data.error || "Failed to save" });
    }
  };

  const edit = (item: NewsItem) => {
    setEditingId(item.id || null);
    setForm({ ...item, publishedAt: item.publishedAt ? item.publishedAt.slice(0, 16) : "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id?: string) => {
    if (!id || !confirm("Delete this article?")) return;
    const res = await fetch(`${API_URL}/api/admin/news/${id}`, { method: "DELETE", headers: { "x-admin-key": key } });
    if (res.ok) { setMsg({ type: "ok", text: "Article deleted" }); load(); }
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <div className="rounded-xl border border-borderc bg-surface2/40 p-8">
          <h1 className="text-2xl font-black text-textc mb-2">Admin Login</h1>
          <p className="text-sm text-mutedc mb-6">Enter your admin key to manage articles.</p>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className={labelCls}>Admin Key</label>
              <input type="password" className={inputCls} value={key} onChange={(e) => setKey(e.target.value)} placeholder="········" required />
            </div>
            {msg && <p className={`text-sm ${msg.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</p>}
            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg transition">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-textc">News Admin</h1>
        <button onClick={() => setAuthed(false)} className="text-sm text-mutedc hover:text-textc border border-borderc rounded-md px-3 py-1.5 transition">Log out</button>
      </div>

      {msg && (
        <p className={`mb-6 text-sm rounded-lg px-4 py-3 border ${msg.type === "ok" ? "text-emerald-400 border-emerald-800 bg-emerald-950/30" : "text-red-400 border-red-800 bg-red-950/30"}`}>{msg.text}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={save} className="space-y-4 rounded-xl border border-borderc bg-surface2/40 p-6 h-fit">
          <h2 className="text-lg font-bold text-textc">{editingId ? "Edit Article" : "New Article"}</h2>
          <div><label className={labelCls}>Title *</label><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label className={labelCls}>Slug</label><input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-article-slug" /></div>
          <div><label className={labelCls}>Excerpt</label><textarea className={`${inputCls} h-20`} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
          <div><label className={labelCls}>Content (Markdown)</label><textarea className={`${inputCls} h-48 font-mono text-xs`} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Category</label><select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className={labelCls}>Author</label><input className={inputCls} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
          </div>
          <div><label className={labelCls}>Cover Image URL</label><input className={inputCls} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Published At</label><input type="datetime-local" className={inputCls} value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} /></div>
            <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm text-mutedc cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-red-600" /> Featured</label></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition">{loading ? "Saving..." : editingId ? "Update" : "Publish"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }} className="px-4 py-2.5 border border-borderc text-mutedc rounded-lg hover:bg-surface2 transition text-sm">Cancel</button>}
          </div>
        </form>

        {/* Reddit Bot Panel */}
        <div className="rounded-xl border border-borderc bg-surface2/40 p-6 h-fit">
          <h2 className="text-lg font-bold text-textc mb-3">Reddit Bot</h2>
          <p className="text-sm text-mutedc mb-4">Auto-fetch and rewrite Reddit posts into news articles with AI.</p>
          <a href="/admin/reddit" className="block w-full text-center bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg transition text-sm">Open Reddit Bot →</a>
        </div>

        <div className="rounded-xl border border-borderc bg-surface2/40 p-6 h-fit">
          <h2 className="text-lg font-bold text-textc mb-4">Articles ({news.length})</h2>
          {news.length === 0 && <p className="text-sm text-mutedc">No articles yet.</p>}
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {news.map((item) => (
              <div key={item.id || item.slug} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-borderc hover:border-zinc-600 transition">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-red-500">{item.category}</span>
                    {item.featured && <span className="text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">★</span>}
                  </div>
                  <p className="text-sm font-semibold text-textc truncate mt-1">{item.title}</p>
                  <p className="text-xs text-mutedc mt-0.5">{new Date(item.publishedAt).toLocaleDateString("en-US")}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => edit(item)} className="text-xs px-2.5 py-1.5 rounded border border-borderc text-mutedc hover:bg-surface2 transition">Edit</button>
                  <button onClick={() => remove(item.id)} className="text-xs px-2.5 py-1.5 rounded border border-red-900 text-red-400 hover:bg-red-950 transition">Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
