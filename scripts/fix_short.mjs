// Re-write short articles (under 1500 chars) with 1000+ word content
import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin";
const DB = process.env.MONGODB_DB || "testnews";
const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "https://omniroute.fermag.com.tr/v1";
const OMNIROUTE_KEY = process.env.OMNIROUTE_KEY || "sk-62c8ee7322b7afa9-c14fc0-1a970cf2";

async function aiRewrite(title, excerpt, category, language) {
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
            content: `You are a news editor for a news website. Write a professional, detailed news article from this source.\n\nPOST TITLE: ${title}\nEXCERPT: ${(excerpt || "").slice(0, 500)}\n\nRULES:\n- Write in ${language || "English"}\n- Create an engaging news headline (max 15 words)\n- Write a 3-4 sentence summary (excerpt)\n- Write a DETAILED article of AT LEAST 1000 WORDS (4-8 paragraphs with ## headings). Go deep: background, context, implications, what's next\n- Be factual and neutral — do NOT mention Reddit\n- Category: World, Technology, Business, Sports, Science, Health, or Entertainment\n\nRespond with ONLY valid JSON:\n{"title":"...","excerpt":"...","content":"...","category":"..."}`,
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
  } catch (e) {
    console.log(`  err: ${e.message}`);
    return null;
  }
}

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
await client.connect();
const db = client.db(DB);
const col = db.collection("news");

const articles = (await col.find({ source: "reddit" }).toArray())
  .filter((n) => (n.content || "").length < 1500);

console.log(`${articles.length} short articles to rewrite`);

let fixed = 0;
for (const n of articles) {
  const result = await aiRewrite(n.title, n.excerpt, n.category, "English");
  if (result && result.content) {
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
    fixed++;
    console.log(`✅ ${n.title.slice(0, 50)} (${result.content.length} chars)`);
  } else {
    console.log(`❌ ${n.title.slice(0, 50)}`);
  }
  await new Promise((r) => setTimeout(r, 1500));
}
console.log(`\nDone: ${fixed}/${articles.length}`);
await client.close();
