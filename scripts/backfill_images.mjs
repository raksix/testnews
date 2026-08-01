// One-off backfill: search images for reddit articles missing them
// Run: node scripts/backfill_images.mjs
import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin";
const DB = process.env.MONGODB_DB || "testnews";
const SEARXNG_URL = process.env.SEARXNG_URL || "http://127.0.0.1:8080";

async function downloadImageAsDataUri(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TestNewsBot/1.0)" },
    });
    if (!res.ok) return "";
    const contentType = res.headers.get("content-type") || "";
    const mime = contentType.split(";")[0].trim();
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime)) return "";
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > 5_000_000) return "";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
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
      for (const r of results.slice(0, 6)) {
        const url = r.img_src || r.thumbnail_src || "";
        if (!url.startsWith("http")) continue;
        const dl = await downloadImageAsDataUri(url);
        if (dl) return dl;
      }
    }
  } catch {}
  // HTML fallback
  try {
    const res = await fetch(
      `${SEARXNG_URL}/search?q=${encodeURIComponent(query)}&categories=images`,
      { signal: AbortSignal.timeout(10_000) }
    );
    const html = await res.text();
    const match = html.match(/data-src="(https?:[^"]+\.(?:jpg|jpeg|png|webp))/i)
      || html.match(/src="(https?:[^"]+\.(?:jpg|jpeg|png|webp))/i);
    if (match) return await downloadImageAsDataUri(match[1]);
  } catch {}
  return "";
}

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
await client.connect();
const db = client.db(DB);
const col = db.collection("news");

const missing = await col
  .find({ source: "reddit", $or: [{ image: "" }, { image: null }, { image: { $exists: false } }] })
  .toArray();
console.log(`Found ${missing.length} articles missing images`);

let fixed = 0;
for (const n of missing) {
  const img = await searchImage(n.title);
  if (img) {
    await col.updateOne({ _id: n._id }, { $set: { image: img } });
    fixed++;
    console.log(`✅ ${n.title.slice(0, 50)}`);
  } else {
    console.log(`❌ ${n.title.slice(0, 50)}`);
  }
  await new Promise((r) => setTimeout(r, 500)); // be gentle
}
console.log(`\nDone: ${fixed}/${missing.length} images added`);
await client.close();
