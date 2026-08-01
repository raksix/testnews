// Re-fetch images for ALL reddit articles with AI-generated content-specific queries
// Run: node scripts/refetch_images.mjs
import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin";
const DB = process.env.MONGODB_DB || "testnews";
const SEARXNG_URL = process.env.SEARXNG_URL || "http://127.0.0.1:8080";
const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "https://omniroute.fermag.com.tr/v1";
const OMNIROUTE_KEY = process.env.OMNIROUTE_KEY || "sk-62c8ee7322b7afa9-c14fc0-1a970cf2";

const IMAGE_BLACKLIST = [
  "cdn.jsdelivr.net", "lucide-static", "devicon", "icon", "logo", "flaticon",
  "iconfinder", "svgrepo", "w3.org", "placehold", "dummyimage", "shields.io",
  "badge", "ui-avatars", "avatar", "gravatar", "emojicdn", "twemoji", "favicon",
];

async function downloadImageAsDataUri(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TestNewsBot/1.0)" },
    });
    if (!res.ok) return "";
    const contentType = res.headers.get("content-type") || "";
    const mime = contentType.split(";")[0].trim();
    if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) return "";
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > 5_000_000 || buffer.length < 5_000) return ""; // skip huge/tiny
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch (err) {
    if (idx < 3) console.log(`  [AI err] ${err.message}`);
    return "";
  }
}

async function searchImage(query) {
  try {
    const res = await fetch(
      `${SEARXNG_URL}/search?q=${encodeURIComponent(query)}&categories=images&format=json`,
      { signal: AbortSignal.timeout(10_000) }
    );
    if (res.ok) {
      const data = await res.json();
      const results = data?.results || [];
      for (const r of results.slice(0, 12)) {
        const url = r.img_src || r.thumbnail_src || "";
        if (!url.startsWith("http")) continue;
        const lower = url.toLowerCase();
        if (IMAGE_BLACKLIST.some((d) => lower.includes(d))) continue;
        if (/\.(svg|ico|gif)$/i.test(url)) continue;
        const dl = await downloadImageAsDataUri(url);
        if (dl) return dl;
      }
    }
  } catch {}
  return "";
}

async function aiImageQuery(title, excerpt, idx) {
  try {
    const res = await fetch(`${OMNIROUTE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OMNIROUTE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "oc/deepseek-v4-flash-free",
        messages: [
          { role: "system", content: "You return ONLY a JSON object. No other text." },
          {
            role: "user",
            content: `Generate a 3-6 word English image search query for a REAL NEWS PHOTO illustrating this story. Describe what a photojournalist would photograph. Never generic words alone.\n\nTITLE: ${title}\nEXCERPT: ${(excerpt || "").slice(0, 300)}\n\nRespond ONLY: {"imageQuery":"..."}`,
          },
        ],
        max_tokens: 200,
        stream: false,
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed.imageQuery || "";
  } catch {
    return "";
  }
}

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
await client.connect();
const db = client.db(DB);
const col = db.collection("news");

const articles = await col
  .find({ source: "reddit" })
  .sort({ createdAt: -1 })
  .limit(40)
  .toArray();
console.log(`Processing ${articles.length} articles`);

let fixed = 0;
for (const n of articles) {
  const q = await aiImageQuery(n.title, n.excerpt, articles.indexOf(n));
  if (!q) {
    console.log(`⏭ no query: ${n.title.slice(0, 45)}`);
    continue;
  }
  const img = await searchImage(q);
  if (img) {
    await col.updateOne({ _id: n._id }, { $set: { image: img } });
    fixed++;
    console.log(`✅ [${q}] ${n.title.slice(0, 45)}`);
  } else {
    console.log(`❌ [${q}] ${n.title.slice(0, 45)}`);
  }
  await new Promise((r) => setTimeout(r, 300));
}
console.log(`\nDone: ${fixed}/${articles.length} images refreshed`);
await client.close();
