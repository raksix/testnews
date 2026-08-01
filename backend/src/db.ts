import { MongoClient, ObjectId, type Db } from "mongodb";

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
    featured: Boolean(data.featured),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = await db.collection<NewsItem>("news").insertOne(doc as any);
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
  name: string;
  content: string;
  createdAt: string;
}

export async function listComments(newsSlug: string): Promise<Comment[]> {
  const db = await getDb();
  const items = await db
    .collection<Comment>("comments")
    .find({ newsSlug })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  return items.map((c) => ({ ...c, id: c._id?.toString() }));
}

export async function createComment(
  data: Omit<Comment, "_id" | "id" | "createdAt">
): Promise<Comment> {
  const db = await getDb();
  const doc: Comment = {
    ...data,
    name: data.name?.trim() ? data.name.trim() : "Anonymous",
    createdAt: new Date().toISOString(),
  };
  const result = await db.collection<Comment>("comments").insertOne(doc as any);
  return { ...doc, id: result.insertedId.toString() };
}
