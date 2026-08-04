"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface Comment {
  id?: string;
  newsSlug: string;
  name: string;
  content: string;
  createdAt: string;
}

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/news/${slug}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {}
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/news/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), content: content.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to post comment");
        return;
      }
      setContent("");
      load();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 border-t border-borderc pt-8">
      <h2 className="text-xl font-black text-textc mb-6">
        Comments <span className="text-mutedc font-normal text-base">({comments.length})</span>
      </h2>

      <form onSubmit={submit} className="mb-8 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional — stays anonymous if empty)"
          className="w-full bg-surface2 border border-borderc rounded-lg px-3 py-2 text-sm text-textc placeholder-mutedc focus:outline-none focus:border-red-500 transition"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full bg-surface2 border border-borderc rounded-lg px-3 py-2 text-sm text-textc placeholder-mutedc focus:outline-none focus:border-red-500 transition resize-none"
          required
        />
        {error && <p className="text-sm text-brand">{error}</p>}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-brand hover:bg-brand disabled:opacity-50 text-white font-bold text-sm px-5 py-2 rounded-lg transition"
        >
          {loading ? "Posting..." : "Post Comment"}
        </button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-mutedc">No comments yet. Be the first to share your thoughts.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="p-4 rounded-lg border border-borderc bg-surface2/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-zinc-600 flex items-center justify-center text-xs font-bold text-white">
                {c.name === "Anonymous" ? "?" : c.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-textc">{c.name}</span>
              <span className="text-xs text-mutedc">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="text-sm text-textc leading-relaxed whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
