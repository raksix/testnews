"use client";
import { useEffect, useState, useMemo } from "react";
import { API_URL } from "@/lib/api";

interface Comment {
  id?: string;
  name: string;
  content: string;
  createdAt: string;
}

const AVATAR_COLORS = [
  "from-red-500 to-orange-500",
  "from-blue-500 to-indigo-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-pink-500",
  "from-amber-500 to-yellow-500",
  "from-cyan-500 to-sky-500",
  "from-rose-500 to-red-500",
  "from-teal-500 to-cyan-500",
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`${API_URL}/api/news/${slug}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {});
  }, [slug]);

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`${API_URL}/api/news/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Anonymous", content: body.trim() }),
      });
      if (res.ok) {
        const { comment } = await res.json();
        setComments((c) => [comment, ...c]);
        setBody("");
      }
    } catch {}
    setPosting(false);
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const avatar = (name: string) => {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  };

  const sorted = useMemo(() => [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [comments]);

  return (
    <section className="mt-12">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-[4px] h-[22px] bg-brand rounded-[2px]" />
          <h2 className="text-xl font-extrabold text-textc tracking-tight">Comments</h2>
          <span className="text-xs font-bold bg-brand/10 text-brand px-2 py-0.5 rounded-full">{comments.length}</span>
        </div>
      </div>

      {/* Yorum formu */}
      <form onSubmit={post} className="mb-8 rounded-xl border border-borderc bg-surface2/40 p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What do you think? Join the discussion…"
          rows={3}
          className="w-full resize-none bg-transparent text-textc placeholder:text-mutedc text-sm focus:outline-none"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-borderc">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-48 bg-transparent text-textc placeholder:text-mutedc text-sm focus:outline-none border-b border-transparent focus:border-brand transition"
          />
          <button
            type="submit"
            disabled={posting || !body.trim()}
            className="bg-brand hover:bg-brand/90 disabled:opacity-40 text-white text-[13px] font-semibold px-5 py-2 rounded-lg transition"
          >
            {posting ? "Posting…" : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Yorum listesi */}
      <div className="space-y-5">
        {sorted.map((c, i) => {
          const id = c.id || `${c.createdAt}-${i}`;
          const likedThis = liked.has(id);
          return (
            <div key={id} className="flex gap-4 group">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatar(c.name)} flex items-center justify-center text-white font-black text-sm shrink-0 select-none`}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-textc text-sm">{c.name}</span>
                  <span className="text-[11px] text-mutedc">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-1 text-[15px] text-textc/90 leading-relaxed">{c.content}</p>
                <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => toggleLike(id)}
                    className={`flex items-center gap-1 text-xs font-semibold transition ${likedThis ? "text-brand" : "text-mutedc hover:text-brand"}`}
                  >
                    <svg viewBox="0 0 24 24" fill={likedThis ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    {likedThis ? "Liked" : "Like"}
                  </button>
                  <button className="flex items-center gap-1 text-xs font-semibold text-mutedc hover:text-brand transition">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Reply
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
