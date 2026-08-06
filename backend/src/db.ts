import { MongoClient, ObjectId, type Db } from "mongodb";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../upload");

// Convert a base64 data-URI image into a real file under upload/,
// returns the public path (/upload/xxx.jpg). Non-data-URI inputs pass through.
export async function saveImageToFile(dataUri: string, slug: string): Promise<string> {
  const m = dataUri.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
  if (!m) return dataUri;
  const ext = m[1].split("/")[1] === "jpeg" ? "jpg" : m[1].split("/")[1];
  const filename = `${slug.replace(/[^a-z0-9_-]/gi, "").slice(0, 70)}.${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(m[2], "base64"));
  return `/upload/${filename}`;
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin";
const MONGODB_DB = process.env.MONGODB_DB || "testnews";

const client = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
});

let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  await client.connect();
  cachedDb = client.db(MONGODB_DB);
  await cachedDb.collection("news").createIndex({ slug: 1 }, { unique: true });
  await cachedDb.collection("news").createIndex({ category: 1 });
  await cachedDb.collection("news").createIndex({ publishedAt: -1 });
  return cachedDb;
}

export interface NewsItem {
  _id?: ObjectId;
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  featured: boolean;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export const CATEGORIES = [
  "World",
  "Technology",
  "Business",
  "Sports",
  "Science",
  "Health",
  "Entertainment",
] as const;

function serialize(item: NewsItem): NewsItem {
  return { ...item, id: item._id?.toString() };
}

export async function listNews(
  category?: string,
  limit = 20,
  offset = 0
): Promise<NewsItem[]> {
  const db = await getDb();
  const filter = category ? { category } : {};
  const items = await db
    .collection<NewsItem>("news")
    .find(filter)
    .sort({ publishedAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
  return items.map(serialize);
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const db = await getDb();
  const item = await db.collection<NewsItem>("news").findOne({ slug });
  return item ? serialize(item) : null;
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return null;
  const item = await db
    .collection<NewsItem>("news")
    .findOne({ _id: new ObjectId(id) });
  return item ? serialize(item) : null;
}

export async function getFeatured(): Promise<NewsItem[]> {
  const db = await getDb();
  const items = await db
    .collection<NewsItem>("news")
    .find({ featured: true })
    .sort({ publishedAt: -1 })
    .limit(5)
    .toArray();
  return items.map(serialize);
}

export async function countByCategory(): Promise<
  { category: string; count: number }[]
> {
  const db = await getDb();
  const agg = await db
    .collection<NewsItem>("news")
    .aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();
  return agg.map((a) => ({ category: a._id, count: a.count }));
}

export async function createNews(
  data: Omit<NewsItem, "_id">
): Promise<NewsItem> {
  const db = await getDb();
  const doc: NewsItem = {
    ...data,
    image: data.image?.startsWith("data:")
      ? await saveImageToFile(data.image, data.slug || `post-${Date.now()}`)
      : data.image,
    featured: Boolean(data.featured),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = await db.collection<NewsItem>("news").insertOne(doc as any);
  seedCommentsForNews(doc.slug, doc.title, doc.category, doc.publishedAt, data.content).catch(() => {});
  return serialize({ ...doc, _id: result.insertedId });
}

export async function updateNews(
  id: string,
  data: Partial<Omit<NewsItem, "_id">>
): Promise<NewsItem | null> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return null;
  const update: Record<string, unknown> = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  if (typeof update.featured === "string")
    update.featured =
      update.featured === "1" || update.featured === "true";
  await db
    .collection<NewsItem>("news")
    .updateOne({ _id: new ObjectId(id) }, { $set: update });
  return getNewsById(id);
}

export async function deleteNews(id: string): Promise<boolean> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return false;
  const result = await db
    .collection<NewsItem>("news")
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export interface Settings {
  _id?: ObjectId;
  key: string;
  value: unknown;
  updatedAt?: string;
}

export const DEFAULT_SETTINGS = {
  reddit: {
    subreddits: [
      "technology",
      "worldnews",
      "science",
      "space",
      "business",
      "economy",
      "gadgets",
      "artificial",
      "Futurology",
      "Health",
    ],
    model: "oc/deepseek-v4-flash-free",
    intervalMinutes: 60,
    enabled: true,
    postsPerSubreddit: 3,
    minUps: 100,
    maxAgeHours: 24,
    language: "English",
    prompt: `You are a news editor for an English news website. Write a professional, detailed news article from this source.

POST TITLE: {title}
EXCERPT: {excerpt}

RULES:
- Write in {language}
- Create an engaging news headline (max 15 words)
- Write a 3-4 sentence summary (excerpt)
- Write a DETAILED article of AT LEAST 1000 WORDS (4-8 paragraphs with ## headings). Go deep: background, context, expert quotes, implications, what's next
- Be factual and neutral — do NOT mention Reddit
- Treat it as original reporting with depth
- Category: World, Technology, Business, Sports, Science, Health, or Entertainment
- Image query: 3-6 word search for a real news photo of THIS SPECIFIC story

Respond with ONLY valid JSON:
{"title":"...","excerpt":"...","content":"...","category":"...","imageQuery":"..."}`,
  },
} as const;

export async function getSettings(): Promise<typeof DEFAULT_SETTINGS> {
  const db = await getDb();
  const col = db.collection<Settings>("settings");
  const merged = structuredClone(DEFAULT_SETTINGS) as Record<string, unknown>;
  for (const key of Object.keys(merged)) {
    const row = await col.findOne({ key });
    if (row && typeof row.value === "object" && row.value !== null) {
      (merged as any)[key] = { ...(merged as any)[key], ...row.value };
    }
  }
  return merged as unknown as typeof DEFAULT_SETTINGS;
}

export async function updateSettings(
  key: string,
  value: unknown
): Promise<void> {
  const db = await getDb();
  await db.collection<Settings>("settings").updateOne(
    { key },
    { $set: { value, updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
}

export async function redditPostExists(redditId: string): Promise<boolean> {
  const db = await getDb();
  const doc = await db.collection("news").findOne({ redditId });
  return Boolean(doc);
}

export interface Comment {
  _id?: ObjectId;
  id?: string;
  newsSlug: string;
  parentId?: string;
  name: string;
  content: string;
  createdAt: string;
  likes?: number;
}

export interface CommentWithReplies extends Comment {
  replies?: Comment[];
}

export async function listComments(newsSlug: string): Promise<CommentWithReplies[]> {
  const db = await getDb();
  const items = await db
    .collection<Comment>("comments")
    .find({ newsSlug })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();
  const parents = items.filter((c) => !c.parentId);
  const parentIds = parents.map((c) => c._id?.toString());
  const replies = items.filter(
    (c) => c.parentId && parentIds.includes(c.parentId)
  );
  return parents.map((c) => ({
    ...c,
    id: c._id?.toString(),
    replies: replies
      .filter((r) => r.parentId === c._id?.toString())
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((r) => ({ ...r, id: r._id?.toString() })),
  }));
}

export async function createComment(
  data: Omit<Comment, "_id" | "id" | "createdAt">
): Promise<Comment> {
  const db = await getDb();
  const doc: Comment = {
    ...data,
    name: data.name?.trim() ? data.name.trim() : "Anonymous",
    likes: 0,
    createdAt: new Date().toISOString(),
  };
  const result = await db.collection<Comment>("comments").insertOne(doc as any);
  return { ...doc, id: result.insertedId.toString() };
}

export async function incrementCommentLikes(id: string): Promise<number | null> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return null;
  const result = await db
    .collection<Comment>("comments")
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $inc: { likes: 1 } }, { returnDocument: "after" });
  return result ? (result.likes ?? 0) : null;
}

const COMMENT_NAMES = [
  "Michael", "Sarah", "John", "Emily", "David", "Jessica", "Chris",
  "Amanda", "Kevin", "Laura", "Jason", "Megan", "Brian", "Nicole",
  "Ryan", "Ashley", "Daniel", "Rachel", "Matthew", "Hannah", "James",
  "Sophie", "Andrew", "Olivia", "Thomas", "Emma", "Robert", "Grace",
];

// Seed 8-20 realistic comments for a news article, spread over the last 48h.
// ~60% generic, ~40% tailored to the article's topic + category.
const STOPWORDS = new Set([
  "the","a","an","and","or","but","of","to","in","on","for","with","at","by",
  "from","as","is","are","was","were","be","been","this","that","these","those",
  "it","its","his","her","their","they","he","she","we","you","i","not","no",
  "says","said","say","after","before","over","under","into","about","up","down",
  "new","first","last","more","most","than","so","if","can","will","would","could",
  "has","have","had","do","does","did","who","what","when","where","why","how",
]);

function topicFromTitle(title: string): string {
  const words = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
  return words.slice(0, 2).join(" ") || "this story";
}

export async function seedCommentsForNews(
  newsSlug: string,
  title?: string,
  category?: string,
  publishedAt?: string,
  content?: string
): Promise<void> {
  const db = await getDb();
  const existing = await db.collection<Comment>("comments").countDocuments({ newsSlug });
  if (existing > 0) return;
  // Don't flood every post with comments — 60% of posts get none,
  // the rest get only a handful, spread out like real readers.
  if (Math.random() < 0.6) return;
  const count = 2 + Math.floor(Math.random() * 3); // 2-4
  const docs: Comment[] = [];
  const usedNames = new Set<string>();

  const topic = title ? topicFromTitle(title) : "";
  // Topic-aware comment templates
  const topicPool = topic
    ? [
        `The situation around ${topic} is way more complex than this article suggests.`,
        `I've been following ${topic} closely and this summary is spot on.`,
        `Finally someone covering ${topic} properly.`,
        `This ${topic} story is going to have ripple effects.`,
        `Not sure everyone realizes how big ${topic} really is.`,
        `Great context on ${topic} — the details matter here.`,
        `Living through ${topic} right now and this is accurate.`,
        `More reporting like this on ${topic}, please.`,
      ]
    : [];

  const pool = topicPool;

  // Realistic spread: newest comment ~now, each one 5-15min earlier.
  let lastTs = Date.now() - Math.floor(Math.random() * 30 * 60 * 1000);
  const floor = publishedAt ? new Date(publishedAt).getTime() : Date.now() - 48 * 60 * 60 * 1000;
  for (let i = 0; i < count; i++) {
    let name = COMMENT_NAMES[Math.floor(Math.random() * COMMENT_NAMES.length)];
    if (usedNames.has(name)) name = name + " " + Math.floor(Math.random() * 99);
    usedNames.add(name);
    let text = pool[Math.floor(Math.random() * pool.length)];
    // First comment is AI-generated from the actual article content
    if (i === 0) {
      const ai = await aiComment(title || "", content || "");
      if (ai) text = ai;
    }
    lastTs -= 5 * 60 * 1000 + Math.floor(Math.random() * 10 * 60 * 1000);
    if (lastTs < floor) lastTs = floor;
    docs.push({
      newsSlug,
      name,
      content: text,
      createdAt: new Date(lastTs).toISOString(),
    });
  }
  let parentIds: string[] = [];
  if (docs.length) {
    const inserted = await db.collection<Comment>("comments").insertMany(docs as any);
    await redistributePostComments(db, newsSlug, publishedAt);
    parentIds = Object.values(inserted.insertedIds).map((id) => id.toString());
  }

  // AI replies: ~40% of comments get 1-2 replies (agree/disagree/argue),
  // timestamped shortly after the parent comment
  const repliers = docs.filter(() => Math.random() < 0.4);
  const replyDocs: Comment[] = [];
  for (const parent of repliers) {
    const parentId = parentIds[docs.indexOf(parent)];
    if (!parentId) continue;
    const replyCount = 1 + Math.floor(Math.random() * 2); // 1-2 replies
    const usedReplyNames = new Set<string>();
    for (let r = 0; r < replyCount; r++) {
      let name = COMMENT_NAMES[Math.floor(Math.random() * COMMENT_NAMES.length)];
      if (usedReplyNames.has(name)) name = name + " " + Math.floor(Math.random() * 99);
      usedReplyNames.add(name);
      let replyText = pool[Math.floor(Math.random() * pool.length)] || "That's a fair point, actually.";
      const aiReply = await aiComment(title || "", parent.content);
      if (aiReply) replyText = aiReply;
      replyDocs.push({
        newsSlug,
        parentId,
        name,
        content: replyText,
        likes: Math.floor(Math.random() * 12),
        createdAt: new Date(
          Math.min(
            Date.now(),
            new Date(parent.createdAt).getTime() +
              (5 + Math.floor(Math.random() * 115)) * 60 * 1000
          )
        ).toISOString(),
      });
    }
  }
  if (replyDocs.length) await db.collection<Comment>("comments").insertMany(replyDocs as any);
}

// Called periodically: recent posts (last 48h) slowly accumulate new
// comments + replies so discussion grows naturally over time.

// Spread a post's comments evenly across the post's lifetime so they
// never look like they were all posted "just now". Also fixes any
// future-dated timestamps (e.g. from clock drift).
async function redistributePostComments(
  db: any,
  newsSlug: string,
  publishedAt?: string
): Promise<void> {
  const comments = await db
    .collection("comments")
    .find({ newsSlug })
    .sort({ createdAt: 1 })
    .toArray();
  if (comments.length < 2) return;
  const pub = publishedAt ? new Date(publishedAt).getTime() : Date.now() - 14 * 24 * 60 * 60 * 1000;
  const start = Math.max(pub, Date.now() - 21 * 24 * 60 * 60 * 1000);
  // newest comment 30-90 min ago, so the thread looks alive but not bunched
  const end = Date.now() - (30 + Math.floor(Math.random() * 60)) * 60 * 1000;
  // span must never exceed (end - start): otherwise late comments
  // land in the future (e.g. when server clock drifts or a post is
  // fresh with many comments). New posts keep a tight but valid window.
  const span = Math.max(1, end - start);
  const bulk = comments.map((c: Comment, i: number) => ({
    updateOne: {
      filter: { _id: c._id },
      update: { $set: { createdAt: new Date(start + (span / comments.length) * (i + 0.5)).toISOString() } },
    },
  }));
  await db.collection("comments").bulkWrite(bulk);
}

export async function addGradualComments(): Promise<number> {
  const db = await getDb();
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const recent = await db
    .collection<NewsItem>("news")
    .find({ publishedAt: { $gte: since } }, { projection: { slug: 1, title: 1, category: 1, publishedAt: 1, content: 1 } })
    .limit(30)
    .toArray();
  if (recent.length === 0) return 0;
  const targets = recent.filter(() => Math.random() < 0.4).slice(0, 3);
  let added = 0;
  for (const n of targets) {
    const newsSlug = n.slug;
    const existing = await db.collection<Comment>("comments").countDocuments({ newsSlug });
    if (existing > 60) continue;
    if (existing < 2) {
      // a brand-new post: don't pile comments on it, skip entirely
      await redistributePostComments(db, newsSlug, n.publishedAt);
      continue;
    }
    const parentCount = 1 + Math.floor(Math.random() * 2);
    const docs: Comment[] = [];
    // Comments land within the last ~12h, spaced 5-15min apart so
    // they look human (never bunched up at the same timestamp).
    let lastTs = Date.now() - Math.floor(Math.random() * 10 * 60 * 1000);
    const floor = Math.max(new Date(n.publishedAt).getTime(), Date.now() - 12 * 60 * 60 * 1000);
    const gTopic = topicFromTitle(n.title);
    const gPool = gTopic
      ? [
          `The situation around ${gTopic} is way more complex than this article suggests.`,
          `I've been following ${gTopic} closely and this summary is spot on.`,
          `Finally someone covering ${gTopic} properly.`,
          `This ${gTopic} story is going to have ripple effects.`,
          `Not sure everyone realizes how big ${gTopic} really is.`,
          `Great context on ${gTopic} — the details matter here.`,
          `Living through ${gTopic} right now and this is accurate.`,
          `More reporting like this on ${gTopic}, please.`,
        ]
      : [];
    for (let i = 0; i < parentCount; i++) {
      lastTs -= 5 * 60 * 1000 + Math.floor(Math.random() * 10 * 60 * 1000);
      if (lastTs < floor) lastTs = floor;
      let text = gPool[Math.floor(Math.random() * gPool.length)] || "Interesting — I'd like to see how this develops.";
      if (i === 0) {
        const ai = await aiComment(n.title, n.content || "");
        if (ai) text = ai;
      }
      docs.push({
        newsSlug,
        name: COMMENT_NAMES[Math.floor(Math.random() * COMMENT_NAMES.length)],
        content: text,
        likes: Math.floor(Math.random() * 15),
        createdAt: new Date(lastTs).toISOString(),
      });
    }
    if (docs.length) {
      const inserted = await db.collection<Comment>("comments").insertMany(docs as any);
      const ids = Object.values(inserted.insertedIds).map((id) => id.toString());
      // 30% chance a new comment gets a reply
      const replyDocs: Comment[] = [];
      for (let i = 0; i < docs.length; i++) {
        if (Math.random() < 0.3 && ids[i]) {
          let replyText = gPool[Math.floor(Math.random() * gPool.length)] || "That's a fair point, actually.";
          const aiReply = await aiComment(n.title, docs[i].content);
          if (aiReply) replyText = aiReply;
          replyDocs.push({
            newsSlug,
            parentId: ids[i],
            name: COMMENT_NAMES[Math.floor(Math.random() * COMMENT_NAMES.length)],
            content: replyText,
            likes: Math.floor(Math.random() * 8),
            createdAt: new Date(
              Math.min(Date.now(), new Date(docs[i].createdAt).getTime() + (5 + Math.floor(Math.random() * 60)) * 60 * 1000)
            ).toISOString(),
          });
        }
      }
      if (replyDocs.length) await db.collection<Comment>("comments").insertMany(replyDocs as any);
      added += docs.length + replyDocs.length;
      // keep this post's comments spread across its lifetime
      await redistributePostComments(db, newsSlug, n.publishedAt);
    }
  }
  return added;
}

// ---------- Analytics ----------

export interface Visit {
  path: string;
  referrer?: string;
  sessionId?: string;
  ip?: string;
  country?: string;
  device?: string;
  browser?: string;
  os?: string;
  createdAt: string;
}

function parseUA(ua: string) {
  let device = "Desktop";
  if (/iPad|Tablet/i.test(ua)) device = "Tablet";
  else if (/Mobile|Android|iPhone/i.test(ua)) device = "Mobile";
  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";
  let os = "Other";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  return { device, browser, os };
}

export async function trackVisit(data: {
  path: string;
  referrer?: string;
  sessionId?: string;
  ip?: string;
  ua?: string;
}): Promise<void> {
  const db = await getDb();
  let country: string | undefined;
  if (data.ip) {
    try {
      const geo = (await import("geoip-lite")).default.lookup(data.ip);
      country = geo?.country;
    } catch {}
  }
  const { device, browser, os } = parseUA(data.ua || "");
  await db.collection<Visit>("visits").insertOne({
    path: data.path || "/",
    referrer: data.referrer || "",
    sessionId: data.sessionId || "",
    ip: data.ip || "",
    country,
    device,
    browser,
    os,
    createdAt: new Date().toISOString(),
  } as any);
}

export async function getAnalytics() {
  const db = await getDb();
  const col = db.collection<Visit>("visits");
  const now = Date.now();
  const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [
    total,
    today,
    online,
    uniqueVisitors,
    daily,
    topPages,
    referrers,
    devices,
    browsers,
    countries,
    recent,
  ] = await Promise.all([
    col.countDocuments(),
    col.countDocuments({ createdAt: { $gte: todayStart } }),
    col.distinct("sessionId", { createdAt: { $gte: fiveMinAgo }, sessionId: { $ne: "" } }),
    col.distinct("sessionId", { sessionId: { $ne: "" } }),
    col
      .aggregate([
        { $match: { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString() } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: { $dateFromString: { dateString: "$createdAt" } } } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    col.aggregate([{ $group: { _id: "$path", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]).toArray(),
    col.aggregate([
      { $project: { ref: { $ifNull: ["$referrer", ""] } } },
      { $group: { _id: "$ref", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray(),
    col.aggregate([{ $group: { _id: "$device", count: { $sum: 1 } } }, { $sort: { count: -1 } }]).toArray(),
    col.aggregate([{ $group: { _id: "$browser", count: { $sum: 1 } } }, { $sort: { count: -1 } }]).toArray(),
    col.aggregate([
      { $match: { country: { $ne: null } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray(),
    col.find({}, { projection: { path: 1, country: 1, device: 1, browser: 1, createdAt: 1, referrer: 1 } }).sort({ createdAt: -1 }).limit(15).toArray(),
  ]);

  const refName = (ref: string) => {
    if (!ref) return "Direct";
    try {
      return new URL(ref).hostname.replace(/^www\./, "");
    } catch {
      return "Direct";
    }
  };

  return {
    total,
    today,
    online: online.length,
    uniqueVisitors: uniqueVisitors.length,
    daily: daily.map((d: any) => ({ date: d._id, count: d.count })),
    topPages: topPages.map((p: any) => ({ path: p._id, count: p.count })),
    referrers: referrers
      .map((r: any) => ({ name: refName(r._id), count: r.count }))
      .filter((r: any) => r.name !== "Direct" || r.count > 0)
      .sort((a: any, b: any) => b.count - a.count),
    devices: devices.map((d: any) => ({ name: d._id, count: d.count })),
    browsers: browsers.map((b: any) => ({ name: b._id, count: b.count })),
    countries: countries.map((c: any) => ({ name: c._id, count: c.count })),
    recent: recent.map((r: any) => ({
      path: r.path,
      country: r.country || "—",
      device: r.device || "—",
      browser: r.browser || "—",
      referrer: r.referrer ? refName(r.referrer) : "Direct",
      createdAt: r.createdAt,
    })),
  };
}

// ─── AI comment generation (via OmniRoute OpenAI-compatible API) ───
const LLM_URL = process.env.LLM_URL || "https://omniroute.fermag.com.tr/v1/chat/completions";
const LLM_MODEL = process.env.LLM_MODEL || "auto/best-coding";

export async function aiComment(title: string, content?: string): Promise<string | null> {
  try {
    const r = await fetch(LLM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LLM_MODEL,
        stream: false,
        max_tokens: 160,
        temperature: 1.05,
        messages: [
          {
            role: "user",
            content: `You are a regular reader commenting on a news article.\n\nTITLE: ${title}\n${content ? `ARTICLE: ${content.slice(0, 1200)}` : ""}\n\nWrite ONE short comment (max 140 characters) that a real reader would post on this article. It must reference the actual topic of the article. Natural, varied, human tone — opinionated, skeptical, curious or personal. No emojis, no hashtags, no quotation marks around the text, no "as an AI". Reply with only the comment text.`,
          },
        ],
      }),
    });
    if (!r.ok) return null;
    const d = (await r.json()) as any;
    const text = d?.choices?.[0]?.message?.content?.trim();
    return text && text.length > 10 && text.length < 300 ? text : null;
  } catch {
    return null;
  }
}
