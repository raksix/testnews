// Simple image backfill: use article title directly as search query
import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin";
const DB = process.env.MONGODB_DB || "testnews";
const SEARXNG_URL = process.env.SEARXNG_URL || "http://127.0.0.1:8080";

const IMAGE_BLACKLIST = [
  "cdn.jsdelivr.net", "lucide-static", "devicon", "icon", "logo", "flaticon",
  "iconfinder", "svgrepo", "w3.org", "placehold", "dummyimage", "shields.io",
  "badge", "ui-avatars", "avatar", "gravatar", "emojicdn", "twemoji", "favicon",
];

async function downloadAsDataUri(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return "";
    const ct = (res.headers.get("content-type") || "").split(";")[0].trim();
    if (!["image/jpeg", "image/png", "image/webp"].includes(ct)) return "";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 5_000_000 || buf.length < 5_000) return "";
    return `data:${ct};base64,${buf.toString("base64")}`;
  } catch { return ""; }
}

async function searchImage(query) {
  try {
    const res = await fetch(`${SEARXNG_URL}/search?q=${encodeURIComponent(query)}&categories=images&format=json`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return "";
    const data = await res.json();
    for (const r of (data?.results || []).slice(0, 12)) {
      const url = r.img_src || r.thumbnail_src || "";
      if (!url.startsWith("http")) continue;
      if (IMAGE_BLACKLIST.some(d => url.toLowerCase().includes(d))) continue;
      if (/\.(svg|ico|gif)$/i.test(url)) continue;
      const dl = await downloadAsDataUri(url);
      if (dl) return dl;
    }
  } catch {}
  return "";
}

function makeQuery(title) {
  // Extract meaningful 3-6 words from the title
  const words = title.replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 6).join(" ");
}

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
await client.connect();
const col = client.db(DB).collection("news");

const missing = await col.find({ source: "reddit", image: { $in: ["", null] } }).toArray();
console.log(`${missing.length} articles missing images`);

let fixed = 0;
for (const n of missing) {
  const q = makeQuery(n.title);
  const img = await searchImage(q);
  if (img) {
    await col.updateOne({ _id: n._id }, { $set: { image: img } });
    fixed++;
    console.log(`✅ [${q}] ${n.title.slice(0, 45)}`);
  } else {
    console.log(`❌ [${q}] ${n.title.slice(0, 45)}`);
  }
  await new Promise(r => setTimeout(r, 400));
}
console.log(`Done: ${fixed}/${missing.length}`);
await client.close();
