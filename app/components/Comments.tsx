"use client";
import { useEffect, useState, useMemo } from "react";
import { API_URL } from "@/lib/api";

interface Comment {
  newsSlug?: string;
  id?: string;
  name: string;
  content: string;
  createdAt: string;
  likes?: number;
  replies?: Comment[];
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

function avatarColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function CommentRow({
  c,
  depth,
  onReply,
}: {
  c: Comment;
  depth: number;
  onReply: (id: string, text: string, name: string) => Promise<void>;
}) {
  const id = c.id || c.createdAt;
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyName, setReplyName] = useState("");
  const [posting, setPosting] = useState(false);
  const [likes, setLikes] = useState(c.likes || 0);
  const [liked, setLiked] = useState(false);

  const like = async () => {
    if (!c.id) return;
    setLiked((l) => !l);
    setLikes((n) => n + (liked ? -1 : 1));
    try {
      await fetch(`${API_URL}/api/news/${c.newsSlug || ""}/comments/${c.id}/like`, { method: "POST" });
    } catch {}
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !c.id) return;
    setPosting(true);
    await onReply(c.id, replyText.trim(), replyName.trim());
    setReplyText("");
    setReplying(false);
    setPosting(false);
  };

  return (
    <div className={depth > 0 ? "mt-4 pl-4 md:pl-6 border-l-2 border-borderc" : ""}>
      <div className="flex gap-3.5 group">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor(c.name)} flex items-center justify-center text-white font-black text-sm shrink-0 select-none`}>
          {c.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-textc text-sm">{c.name}</span>
            <span className="text-[11px] text-mutedc">{timeAgo(c.createdAt)}</span>
          </div>
          <p className="mt-1 text-[15px] text-textc/90 leading-relaxed">{c.content}</p>
          <div className="flex items-center gap-4 mt-1.5 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={like}
              className={`flex items-center gap-1 text-xs font-semibold transition ${liked ? "text-brand" : "text-mutedc hover:text-brand"}`}
            >
              <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {likes > 0 ? likes : "Like"}
            </button>
            <button
              onClick={() => setReplying((r) => !r)}
              className={`flex items-center gap-1 text-xs font-semibold transition ${replying ? "text-brand" : "text-mutedc hover:text-brand"}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Reply
            </button>
          </div>

          {replying && (
            <form onSubmit={submitReply} className="mt-3 rounded-lg border border-borderc bg-surface2/40 p-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${c.name}…`}
                rows={2}
                className="w-full resize-none bg-transparent text-textc placeholder:text-mutedc text-sm focus:outline-none"
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-borderc">
                <input
                  value={replyName}
                  onChange={(e) => setReplyName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-44 bg-transparent text-textc placeholder:text-mutedc text-sm focus:outline-none border-b border-transparent focus:border-brand transition"
                />
                <button
                  type="submit"
                  disabled={posting || !replyText.trim()}
                  className="bg-brand hover:bg-brand/90 disabled:opacity-40 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
                >
                  {posting ? "Posting…" : "Reply"}
                </button>
              </div>
            </form>
          )}

          {(c.replies || []).map((r) => (
            <CommentRow key={r.id || r.createdAt} c={r} depth={depth + 1} onReply={onReply} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const refresh = () => {
    fetch(`${API_URL}/api/news/${slug}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {});
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setComments((c) => [{ ...comment, replies: [] }, ...c]);
        setBody("");
      }
    } catch {}
    setPosting(false);
  };

  const addReply = async (parentId: string, text: string, replyName: string) => {
    try {
      const res = await fetch(`${API_URL}/api/news/${slug}/comments/${parentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: replyName || "Anonymous", content: text }),
      });
      if (res.ok) {
        const { comment } = await res.json();
        setComments((all) =>
          all.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), { ...comment, replies: [] }] }
              : c
          )
        );
      }
    } catch {}
  };

  const total = useMemo(() => {
    let n = comments.length;
    for (const c of comments) n += (c.replies || []).length;
    return n;
  }, [comments]);

  const sorted = useMemo(
    () => [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [comments]
  );

  return (
    <section className="mt-12">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-[4px] h-[22px] bg-brand rounded-[2px]" />
          <h2 className="text-xl font-extrabold text-textc tracking-tight">Comments</h2>
          <span className="text-xs font-bold bg-brand/10 text-brand px-2 py-0.5 rounded-full">{total}</span>
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
      <div className="space-y-6">
        {sorted.map((c, i) => (
          <CommentRow key={c.id || `${c.createdAt}-${i}`} c={c} depth={0} onReply={addReply} />
        ))}
      </div>
    </section>
  );
}
