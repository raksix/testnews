"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface Comment {
  _id: string;
  id?: string;
  newsSlug: string;
  articleTitle?: string;
  name: string;
  content: string;
  createdAt: string;
}

export default function CommentsAdmin({ apiKey }: { apiKey: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/comments`, {
        headers: { "x-admin-key": apiKey },
      });
      const data = await res.json();
      setComments(data.comments || []);
    } catch {} finally { setLoading(false); }
  }, [apiKey]);

  useEffect(() => { load(); }, [load]);

  const remove = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: { "x-admin-key": apiKey },
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => (c._id || c.id) !== commentId));
        setMsg({ type: "ok", text: "Comment deleted" });
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: "err", text: "Delete failed" });
      }
    } catch { setMsg({ type: "err", text: "Delete failed" }); }
  };

  const filtered = comments.filter(c =>
    !filter ||
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.content.toLowerCase().includes(filter.toLowerCase()) ||
    (c.articleTitle || c.newsSlug).toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-borderc border-t-red-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-textc">Comments</h1>
          <p className="text-mutedc text-sm mt-1">{comments.length} total comments</p>
        </div>
        <button onClick={load} className="text-xs border border-borderc text-mutedc hover:text-textc px-3 py-1.5 rounded-lg transition">Refresh</button>
      </div>

      {msg && <p className={`text-sm rounded-lg px-4 py-3 border ${msg.type === "ok" ? "text-emerald-400 border-emerald-800 bg-emerald-950/30" : "text-red-400 border-red-800 bg-red-950/30"}`}>{msg.text}</p>}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <input
          className="bg-surface2 border border-borderc rounded-lg px-4 py-2 text-sm text-textc placeholder-mutedc focus:outline-none focus:border-red-500 transition flex-1 max-w-md"
          placeholder="Filter by name, content, or article..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <span className="text-sm text-mutedc">{filtered.length} shown</span>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-mutedc">No comments found</div>
        )}
        {filtered.map(c => (
          <div key={c._id || c.id} className="rounded-xl border border-borderc bg-surface2/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-zinc-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {c.name === "Anonymous" ? "?" : c.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-textc">{c.name}</span>
                  <span className="text-[10px] text-mutedc">
                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <a href={`/news/${c.newsSlug}`} target="_blank" className="text-[10px] text-red-400 hover:text-red-300 transition truncate max-w-[200px]">
                    → {c.articleTitle || c.newsSlug}
                  </a>
                </div>
                <p className="text-sm text-textc leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
              <button
                onClick={() => remove(c._id || c.id || "")}
                className="text-xs px-2.5 py-1.5 rounded border border-red-900 text-red-400 hover:bg-red-950 transition shrink-0"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
