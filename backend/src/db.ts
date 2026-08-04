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
  seedCommentsForNews(doc.slug, doc.title, doc.category).catch(() => {});
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

const COMMENT_NAMES = [
  "Michael", "Sarah", "John", "Emily", "David", "Jessica", "Chris",
  "Amanda", "Kevin", "Laura", "Jason", "Megan", "Brian", "Nicole",
  "Ryan", "Ashley", "Daniel", "Rachel", "Matthew", "Hannah", "James",
  "Sophie", "Andrew", "Olivia", "Thomas", "Emma", "Robert", "Grace",
];

const COMMENT_TEXTS = [
  "This is actually a really important development. Thanks for covering it.",
  "Finally some proper journalism on this topic.",
  "I can't believe this hasn't gotten more attention.",
  "The details here are a bit thin, but interesting nonetheless.",
  "Wait, is this confirmed by official sources?",
  "Great analysis. This puts things in perspective.",
  "About time someone reported this properly.",
  "I've been following this for weeks, good to see it summarized.",
  "This will have bigger consequences than people realize.",
  "Interesting take, though I'd like to see more data.",
  "The headline says it all, honestly.",
  "This comment section is more balanced than I expected.",
  "Sharing this with my colleagues right now.",
  "One of the better articles I've read on this subject.",
  "Can we get a follow-up on this? Would love more context.",
  "Not sure I agree with the conclusion, but the reporting is solid.",
  "This is exactly why I read this site.",
  "Wild stuff. The next few months will be telling.",
  "Good breakdown. Easy to understand even for non-experts.",
  "I was just talking about this yesterday!",
  "The sources check out. Reliable piece.",
  "This deserves way more coverage.",
  "Honestly refreshing to see unbiased reporting.",
  "Bookmarked. Very useful summary.",
  "The comments here are actually civil, nice change.",
  "Strong piece. Keep up the good work.",
  "This changes the picture significantly.",
  "I'll be watching how this develops.",
  "Excellent breakdown, very clear and concise.",
  "Someone had to say this. Glad it was this outlet.",
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

const CATEGORY_COMMENTS: Record<string, string[]> = {
  Technology: [
    "The engineering behind this is genuinely impressive.",
    "As a developer, I can tell this took serious work to pull off.",
    "Tech moves fast, but this is a real step forward.",
    "Curious what the open-source community thinks of this one.",
  ],
  Business: [
    "Markets are definitely going to react to this one.",
    "The analysts are going to have a field day with this.",
    "Smart move, but the margins will tell the real story.",
    "This is what happens when leadership plans ahead.",
  ],
  Sports: [
    "The form this season has been something else.",
    "The coaching staff deserves a lot of credit here.",
    "That was a performance worth staying up for.",
    "Injuries aside, the squad depth really showed tonight.",
  ],
  Science: [
    "Fascinating research. Peer review will be key here.",
    "The methodology looks solid, excited to see replication studies.",
    "This could open a whole new line of inquiry.",
    "Science at its best — patient, rigorous, promising.",
  ],
  Health: [
    "The public health impact of this is significant.",
    "Doctors will be watching the follow-up data closely.",
    "As someone in healthcare, this matters more than it seems.",
    "Prevention beats treatment — glad this is getting attention.",
  ],
  Entertainment: [
    "The box office numbers will be interesting to watch.",
    "Critics are split, but the audience seems to love it.",
    "The production value alone is worth the hype.",
    "This one is going to be talked about for a while.",
  ],
};

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
  category?: string
): Promise<void> {
  const db = await getDb();
  const existing = await db.collection<Comment>("comments").countDocuments({ newsSlug });
  if (existing > 0) return;
  const count = 8 + Math.floor(Math.random() * 13); // 8-20
  const now = Date.now();
  const docs: Comment[] = [];
  const usedNames = new Set<string>();

  const topic = title ? topicFromTitle(title) : "";
  const catPool = (category && CATEGORY_COMMENTS[category]) || [];
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

  const pool = [...COMMENT_TEXTS, ...catPool, ...topicPool];

  for (let i = 0; i < count; i++) {
    let name = COMMENT_NAMES[Math.floor(Math.random() * COMMENT_NAMES.length)];
    if (usedNames.has(name)) name = name + " " + Math.floor(Math.random() * 99);
    usedNames.add(name);
    docs.push({
      newsSlug,
      name,
      content: pool[Math.floor(Math.random() * pool.length)],
      createdAt: new Date(now - Math.floor(Math.random() * 48 * 60 * 60 * 1000)).toISOString(),
    });
  }
  if (docs.length) await db.collection<Comment>("comments").insertMany(docs as any);
}
