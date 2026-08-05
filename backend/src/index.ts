import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  listNews,
  getNewsBySlug,
  getNewsById,
  getFeatured,
  countByCategory,
  createNews,
  updateNews,
  deleteNews,
  listComments,
  createComment,
  incrementCommentLikes,
  getSettings,
  updateSettings,
  getDb,
  slugify,
} from "./db.js";
import { runRedditFetch } from "./redditBot.js";

const PORT = Number(process.env.PORT || 3013);
const ADMIN_KEY = process.env.ADMIN_KEY || "testnews-admin-2026";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-admin-key"],
});

// Health
app.get("/health", async () => ({ ok: true }));

// Stats for admin dashboard
app.get("/api/admin/stats", async (req, reply) => {
  const headers = req.headers as Record<string, string | undefined>;
  if (headers["x-admin-key"] !== ADMIN_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  const db = await getDb();
  const col = db.collection("news");
  const [total, reddit, byCategory, todayCount, commentCount] = await Promise.all([
    col.countDocuments(),
    col.countDocuments({ source: "reddit" }),
    col.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]).toArray(),
    col.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)).toISOString() } }),
    db.collection("comments").countDocuments(),
  ]);
  return { total, reddit, today: todayCount, comments: commentCount, byCategory: byCategory.map((c: any) => ({ category: c._id, count: c.count })) };
});

// List news: /api/news?category=&limit=&offset=&featured=1
app.get("/api/news", async (req) => {
  const q = req.query as Record<string, string | undefined>;
  if (q.featured === "1") {
    return { news: await getFeatured() };
  }
  const [news, categories] = await Promise.all([
    listNews(q.category, Number(q.limit || 20), Number(q.offset || 0)),
    countByCategory(),
  ]);
  return { news, categories };
});

// Admin: news list without images (fast, light payload)
app.get("/api/admin/news", async (req, reply) => {
  const headers = req.headers as Record<string, string | undefined>;
  if (headers["x-admin-key"] !== ADMIN_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  const db = await getDb();
  const items = await db
    .collection("news")
    .find({}, { projection: { image: 0, content: 0 } })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();
  return { news: items };
});

// Single article
app.get<{ Params: { slug: string } }>("/api/news/:slug", async (req, reply) => {
  const news = await getNewsBySlug(req.params.slug);
  if (!news) return reply.code(404).send({ error: "News not found" });
  return { news };
});

// Comments
app.get<{ Params: { slug: string } }>(
  "/api/news/:slug/comments",
  async (req) => {
    const comments = await listComments(req.params.slug);
    return { comments };
  }
);

app.post<{ Params: { slug: string } }>(
  "/api/news/:slug/comments",
  async (req, reply) => {
    const body = (req.body || {}) as { name?: string; content?: string };
    if (!body.content?.trim()) {
      return reply.code(400).send({ error: "Content is required" });
    }
    const comment = await createComment({
      newsSlug: req.params.slug,
      name: body.name || "Anonymous",
      content: body.content.trim(),
    });
    return reply.code(201).send({ comment });
  }
);

// OG image proxy: serve the article image from a real URL (data URIs
// don't work in og:image for Discord/Telegram/WhatsApp previews)
app.get<{ Params: { slug: string } }>(
  "/api/og-image/:slug",
  async (req, reply) => {
    const news = await getNewsBySlug(req.params.slug);
    if (!news || !news.image) return reply.code(404).send();
    const img = news.image;
    if (img.startsWith("data:")) {
      const m = img.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
      if (!m) return reply.code(404).send();
      reply.header("Content-Type", m[1]);
      reply.header("Cache-Control", "public, max-age=86400");
      return reply.send(Buffer.from(m[2], "base64"));
    }
    return reply.redirect(img);
  }
);
// Reply to a comment
app.post<{ Params: { slug: string; id: string } }>(
  "/api/news/:slug/comments/:id/reply",
  async (req, reply) => {
    const body = (req.body || {}) as { name?: string; content?: string };
    if (!body.content?.trim()) {
      return reply.code(400).send({ error: "Content is required" });
    }
    const comment = await createComment({
      newsSlug: req.params.slug,
      parentId: req.params.id,
      name: body.name || "Anonymous",
      content: body.content.trim(),
    });
    return reply.code(201).send({ comment });
  }
);
// Like a comment
app.post<{ Params: { slug: string; id: string } }>(
  "/api/news/:slug/comments/:id/like",
  async (req, reply) => {
    const likes = await incrementCommentLikes(req.params.id);
    if (likes === null) return reply.code(404).send({ error: "Comment not found" });
    return { likes };
  }
);
// Delete comment (admin)
app.delete<{ Params: { id: string } }>(
  "/api/admin/comments/:id",
  async (req, reply) => {
    const headers = req.headers as Record<string, string | undefined>;
    if (headers["x-admin-key"] !== ADMIN_KEY) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    const { getDb } = await import("./db.js");
    const db = await getDb();
    const result = await db.collection("comments").deleteOne({ _id: new (await import("mongodb")).ObjectId(req.params.id) });
    if (result.deletedCount === 0) return reply.code(404).send({ error: "Not found" });
    return { ok: true };
  }
);

// All comments with article titles (admin, single request)
app.get("/api/admin/comments", async (req, reply) => {
  const headers = req.headers as Record<string, string | undefined>;
  if (headers["x-admin-key"] !== ADMIN_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  const db = await getDb();
  const comments = await db
    .collection("comments")
    .find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();
  // Attach article title for each comment
  const slugs = [...new Set(comments.map((c: any) => c.newsSlug))];
  const articles = await db
    .collection("news")
    .find({ slug: { $in: slugs } }, { projection: { slug: 1, title: 1 } })
    .toArray();
  const titleMap = new Map(articles.map((a: any) => [a.slug, a.title]));
  return {
    comments: comments.map((c: any) => ({ ...c, articleTitle: titleMap.get(c.newsSlug) || c.newsSlug })),
  };
});

// Admin auth
app.post("/api/admin/auth", async (req, reply) => {
  const body = (req.body || {}) as { key?: string };
  if (body.key === ADMIN_KEY) return { ok: true };
  return reply.code(401).send({ error: "Invalid key" });
});

// Create
app.post("/api/admin/news", async (req, reply) => {
  const headers = req.headers as Record<string, string | undefined>;
  if (headers["x-admin-key"] !== ADMIN_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  const body = req.body as Record<string, unknown>;
  const news = await createNews({
    slug: (body.slug as string) || slugify(String(body.title || "")),
    title: String(body.title || ""),
    excerpt: String(body.excerpt || ""),
    content: String(body.content || ""),
    category: String(body.category || "World"),
    image: String(body.image || ""),
    author: String(body.author || "News Desk"),
    featured: Boolean(body.featured),
    publishedAt: String(body.publishedAt || new Date().toISOString()),
  });
  return reply.code(201).send({ news });
});

// Update
app.put<{ Params: { id: string } }>(
  "/api/admin/news/:id",
  async (req, reply) => {
    const headers = req.headers as Record<string, string | undefined>;
    if (headers["x-admin-key"] !== ADMIN_KEY) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    const news = await updateNews(req.params.id, (req.body || {}) as never);
    if (!news) return reply.code(404).send({ error: "News not found" });
    return { news };
  }
);

// Delete
app.delete<{ Params: { id: string } }>(
  "/api/admin/news/:id",
  async (req, reply) => {
    const headers = req.headers as Record<string, string | undefined>;
    if (headers["x-admin-key"] !== ADMIN_KEY) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    const ok = await deleteNews(req.params.id);
    if (!ok) return reply.code(404).send({ error: "News not found" });
    return { ok: true };
  }
);

// Settings
app.get("/api/admin/settings", async (req, reply) => {
  const headers = req.headers as Record<string, string | undefined>;
  if (headers["x-admin-key"] !== ADMIN_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  return { settings: await getSettings() };
});

app.put("/api/admin/settings", async (req, reply) => {
  const headers = req.headers as Record<string, string | undefined>;
  if (headers["x-admin-key"] !== ADMIN_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  const body = (req.body || {}) as Record<string, unknown>;
  if (body.reddit && typeof body.reddit === "object") {
    await updateSettings("reddit", body.reddit);
  }
  return { settings: await getSettings() };
});

// Reddit bot logs
app.get("/api/admin/reddit/logs", async (req, reply) => {
  const headers = req.headers as Record<string, string | undefined>;
  if (headers["x-admin-key"] !== ADMIN_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  try {
    const { execSync } = await import("node:child_process");
    // Pull recent bot log lines from PM2
    const out = execSync('pm2 logs testnews-backend --lines 40 --nostream 2>/dev/null | grep -iE "scheduled|fetch|created|error" | tail -30', { encoding: "utf8", timeout: 8000 });
    const lines = out.split("\n").filter(Boolean);
    return { logs: lines.length ? lines.slice(-30) : ["No recent bot activity — waiting for next fetch"] };
  } catch {
    return { logs: ["Unable to read logs"] };
  }
});

// Reddit bot: manual trigger
app.post("/api/admin/reddit/fetch", async (req, reply) => {
  const headers = req.headers as Record<string, string | undefined>;
  if (headers["x-admin-key"] !== ADMIN_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  try {
    const result = await runRedditFetch();
    return { result };
  } catch (err) {
    return reply.code(500).send({
      error: err instanceof Error ? err.message : "Reddit fetch failed",
    });
  }
});

// Available AI models from OmniRoute
app.get("/api/admin/models", async (req, reply) => {
  const headers = req.headers as Record<string, string | undefined>;
  if (headers["x-admin-key"] !== ADMIN_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  try {
    const res = await fetch(
      `${process.env.OMNIROUTE_URL || "https://omniroute.fermag.com.tr/v1"}/models`,
      { headers: { Authorization: `Bearer ${process.env.OMNIROUTE_KEY || ""}` } }
    );
    if (!res.ok) return reply.code(502).send({ error: "Failed to fetch models" });
    const data = await res.json();
    const ids = (data?.data || []).map((m: { id: string }) => m.id);
    return { models: ids };
  } catch {
    return reply.code(502).send({ error: "Failed to fetch models" });
  }
});

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

// Scheduled Reddit fetch — checks every minute whether interval has elapsed
let lastFetchAt = 0;
let fetchInProgress = false;

async function scheduledFetch() {
  if (fetchInProgress) return;
  fetchInProgress = true;
  try {
    app.log.info("Scheduled Reddit fetch started");
    const result = await runRedditFetch();
    app.log.info(
      `Scheduled Reddit fetch done: created=${result.created} skipped=${result.skipped} errors=${result.errors.length}`
    );
  } catch (err) {
    app.log.error(`Scheduled Reddit fetch failed: ${err}`);
  } finally {
    fetchInProgress = false;
  }
}

setInterval(async () => {
  try {
    const settings = await getSettings();
    if (!settings.reddit.enabled) return;
    const intervalMs = settings.reddit.intervalMinutes * 60_000;
    if (Date.now() - lastFetchAt >= intervalMs) {
      lastFetchAt = Date.now();
      scheduledFetch();
    }
  } catch {}
}, 60_000);
