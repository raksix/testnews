// Re-write all Reddit articles with 1000+ word content
// Run: node scripts/refetch_content.mjs
import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin";
const DB = process.env.MONGODB_DB || "testnews";
const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "https://omniroute.fermag.com.tr/v1";
const OMNIROUTE_KEY = process.env.OMNIROUTE_KEY || "sk-62c8ee7322b7afa9-c14fc0-1a970cf2";

const CONCURRENCY = 3; // parallel workers

async function aiRewrite(title, excerpt, category, sub) {
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
          { role: "system", content: "You are a professional news editor. Always respond with valid JSON only." },
          {
            role: "user",
            content: `You are a news editor for an English news website. Write a professional, detailed news article from this source.\n\nPOST TITLE: ${title}\nEXCERPT: ${(excerpt || "").slice(0, 500)}\nSOURCE: r/${sub || "news"}\n\nRULES:\n- Write in ENGLISH\n- Create an engaging news headline (max 15 words)\n- Write a 3-4 sentence summary (excerpt)\n- Write a DETAILED article of AT LEAST 1000 WORDS (4-8 paragraphs with ## headings). Go deep: background, context, expert quotes, implications, what's next\n- Be factual and neutral — do NOT mention Reddit\n- Treat it as original reporting with depth\n- Category: World, Technology, Business, Sports, Science, Health, or Entertainment\n\nRespond with ONLY valid JSON:\n{"title":"...","excerpt":"...","content":"...","category":"..."}`,
          },
        ],
        max_tokens: 500000,
        stream: false,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    if (!text) return null;
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
await client.connect();
const db = client.db(DB);
const col = db.collection("news");

const articles = await col
  .find({ source: "reddit" })
  .sort({ createdAt: -1 })
  .toArray();
console.log(`${articles.length} articles to rewrite`);

let done = 0;
let failed = 0;

// Process in batches of CONCURRENCY
for (let i = 0; i < articles.length; i += CONCURRENCY) {
  const batch = articles.slice(i, i + CONCURRENCY);
  const results = await Promise.allSettled(
    batch.map(async (n) => {
      const result = await aiRewrite(n.title, n.excerpt, n.category, n.sourceSubreddit);
      if (!result) throw new Error("AI returned null");
      
      // Update content and excerpt, keep image and other fields
      await col.updateOne(
        { _id: n._id },
        {
          $set: {
            title: result.title || n.title,
            excerpt: result.excerpt || n.excerpt,
            content: result.content,
            category: result.category || n.category,
          },
        }
      );
      return n.title;
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") {
      done++;
      console.log(`✅ [${done}/${articles.length}] ${r.value.slice(0, 50)}`);
    } else {
      failed++;
      console.log(`❌ ${r.reason?.message || "error"}`);
    }
  }

  // Small delay between batches to be nice to the API
  if (i + CONCURRENCY < articles.length) {
    await new Promise((r) => setTimeout(r, 2000));
  }
}

console.log(`\nDone: ${done}/${articles.length} rewritten, ${failed} failed`);
await client.close();
