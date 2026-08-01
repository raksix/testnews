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
  slugify,
} from "./db.js";

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

// Admin auth
app.post("/api/admin/auth", async (req) => {
  const body = (req.body || {}) as { key?: string };
  if (body.key === ADMIN_KEY) return { ok: true };
  return { error: "Invalid key" };
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

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
