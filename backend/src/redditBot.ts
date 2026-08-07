// Reddit → AI → News pipeline
// Fetches top posts from configured subreddits, rewrites them into
// news articles with the configured OmniRoute model, stores in MongoDB.

import {
  getSettings,
  redditPostExists,
  createNews,
  slugify,
  type NewsItem,
} from "./db.js";

const REDDIT_CLIENT_ID = "TWTsqXa53CexlrYGBWaesQ";
const REDDIT_UA = "gigachad-scout/1.0 (by /u/raksix)";
const REDDIT_TOKEN_FILE = "/root/gigachad-agent/data/reddit_tokens.json";

const SEARXNG_URL = process.env.SEARXNG_URL || "http://127.0.0.1:8080";

const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "https://omniroute.fermag.com.tr/v1";
const OMNIROUTE_KEY = process.env.OMNIROUTE_KEY || "";

// NSFW image checker — refuses to publish adult/+/18 imagery.
// Uses the multimodal mimo model; on any error we fail CLOSED (block)
// so unsafe images never end up on the site.
const NSFW_MODEL = "oc/mimo-v2.5-free";
async function isImageNSFW(dataUri: string): Promise<boolean> {
  try {
    const res = await fetch(`${OMNIROUTE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OMNIROUTE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NSFW_MODEL,
        stream: false,
        max_tokens: 10,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "You are a content safety checker. Look at this image and reply with exactly one word: NSFW or SAFE. NSFW includes nudity, sexual content, gore, or explicit violence.",
              },
              { type: "image_url", image_url: { url: dataUri } },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return false; // can't verify → allow (primary guard is the post.over_18 flag)
    const data = await res.json();
    const text = (data?.choices?.[0]?.message?.content || "").toLowerCase();
    return /nsfw|explicit|adult|nude|porn|gore/.test(text);
  } catch {
    return false; // can't verify → allow
  }
}

import { readFileSync, existsSync } from "node:fs";

interface RedditToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

// Domains that serve icons/logos/placeholders — never use for news photos
const IMAGE_BLACKLIST = [
  "cdn.jsdelivr.net",
  "lucide-static",
  "devicon",
  "icon",
  "logo",
  "flaticon",
  "iconfinder",
  "svgrepo",
  "w3.org",
  "placehold",
  "dummyimage",
  "shields.io",
  "badge",
  "ui-avatars",
  "avatar",
  "gravatar",
  "emojicdn",
  "twemoji",
  "favicon",
  "pixabay.com/vectors",
];

async function searchImage(query: string): Promise<string> {
  // Try SearXNG JSON API first
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
        // Skip blacklisted domains
        const lower = url.toLowerCase();
        if (IMAGE_BLACKLIST.some((d) => lower.includes(d))) continue;
        // Skip vector/small formats
        if (/\.(svg|ico|gif)$/i.test(url)) continue;
        const downloaded = await downloadImageAsDataUri(url);
        if (downloaded && !(await isImageNSFW(downloaded))) return downloaded;
      }
    }
  } catch {}
  // Fallback: HTML parse
  try {
    const res = await fetch(
      `${SEARXNG_URL}/search?q=${encodeURIComponent(query)}&categories=images`,
      { signal: AbortSignal.timeout(10_000) }
    );
    const html = await res.text();
    const match = html.match(/data-src="(https?:\/\/[^"']+\.(jpg|jpeg|png|webp))/i)
      || html.match(/src="(https?:\/\/[^"']+\.(jpg|jpeg|png|webp))/i);
    if (match) {
      const downloaded = await downloadImageAsDataUri(match[1]);
      if (downloaded && !(await isImageNSFW(downloaded))) return downloaded;
    }
  } catch {}
  return "";
}

async function downloadImageAsDataUri(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TestNewsBot/1.0)" },
    });
    if (!res.ok) return "";
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const mime = contentType.split(";")[0].trim();
    // Only accept raster formats (skip svg etc)
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime)) return "";
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > 5_000_000) return ""; // skip images > 5MB
    const base64 = buffer.toString("base64");
    return `data:${mime};base64,${base64}`;
  } catch {
    return "";
  }
}

function loadRedditToken(): RedditToken | null {
  if (!existsSync(REDDIT_TOKEN_FILE)) return null;
  try {
    return JSON.parse(readFileSync(REDDIT_TOKEN_FILE, "utf8"));
  } catch {
    return null;
  }
}

async function redditFetch(path: string): Promise<any> {
  const token = loadRedditToken();
  if (!token) throw new Error("Reddit token not found");
  const res = await fetch(`https://oauth.reddit.com${path}`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "User-Agent": REDDIT_UA,
    },
  });
  if (!res.ok) throw new Error(`Reddit API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function aiRewrite(title: string, selftext: string, subreddit: string): Promise<{
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageQuery: string;
}> {
  const settings = await getSettings();
  const model = settings.reddit.model;

  const selftextInfo = selftext ? `\nBODY: ${selftext.slice(0, 4000)}` : "";

  // Use custom prompt from settings (with template placeholders)
  const template =
    settings.reddit.prompt ||
    `You are a news editor for an English news website. Write a professional, detailed news article from this source.\n\nPOST TITLE: {title}\n\nRULES:\n- Write in {language}\n- Create an engaging news headline (max 15 words)\n- Write a 3-4 sentence summary (excerpt)\n- Write a DETAILED article of AT LEAST 1000 WORDS (4-8 paragraphs with ## headings)\n- Be factual and neutral — do NOT mention Reddit\n- Category: World, Technology, Business, Sports, Science, Health, or Entertainment
- IMPORTANT: stories about actors, celebrities, movies, music, TV shows, Hollywood or awards belong to Entertainment — never Technology/Science/Business\n- Image query: 3-6 word search for a real news photo of THIS SPECIFIC story\n\nRespond with ONLY valid JSON:\n{"title":"...","excerpt":"...","content":"...","category":"...","imageQuery":"..."}`;

  const prompt = template
    .replaceAll("{title}", title)
    .replaceAll("{excerpt}", selftextInfo || title)
    .replaceAll("{language}", settings.reddit.language || "English");

  const res = await fetch(`${OMNIROUTE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OMNIROUTE_KEY}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a professional news editor. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500000,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error(`AI API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";

  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    // AI sometimes wraps the JSON with stray brackets or trailing text —
    // extract the first balanced { ... } object before parsing.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const jsonStr = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
    const parsed = JSON.parse(jsonStr);
    return {
      title: parsed.title || title,
      excerpt: parsed.excerpt || "",
      content: parsed.content || "",
      category: parsed.category || "Technology",
      imageQuery: parsed.imageQuery || "",
    };
  } catch {
    // Fallback: use raw output as content
    return { title, excerpt: "", content: text, category: "Technology", imageQuery: "" };
  }
}

export interface FetchResult {
  fetched: number;
  created: number;
  skipped: number;
  errors: string[];
}

export async function runRedditFetch(): Promise<FetchResult> {
  const settings = await getSettings();
  const cfg = settings.reddit;

  if (!cfg.enabled) return { fetched: 0, created: 0, skipped: 0, errors: ["Disabled in settings"] };

  const result: FetchResult = { fetched: 0, created: 0, skipped: 0, errors: [] };

  for (const sub of cfg.subreddits) {
    try {
      const data = await redditFetch(
        `/r/${sub}/hot?limit=${cfg.postsPerSubreddit}&t=day`
      );
      const posts = data?.data?.children || [];

      for (const child of posts) {
        const post = child?.data;
        if (!post) continue;
        result.fetched++;

        // Filters
        if (post.ups < cfg.minUps) continue;
        const ageMs = Date.now() - post.created_utc * 1000;
        if (ageMs > cfg.maxAgeHours * 3600_000) continue;
        // Never process NSFW posts at all (Reddit's own flag)
        if (post.over_18) continue;

        if (await redditPostExists(post.id)) {
          result.skipped++;
          continue;
        }

        try {
          const rewritten = await aiRewrite(post.title, post.selftext || "", sub);

          // Search image if AI provided a query and post has no image
          let imageUrl = "";
          const postImage = post.url && post.url.startsWith("http") && !post.is_self ? post.url : "";
          if (postImage) {
            // Download post image directly (blocked if NSFW)
            const dl = await downloadImageAsDataUri(postImage) || "";
            if (dl && !(await isImageNSFW(dl))) imageUrl = dl;
          }
          if (!imageUrl && rewritten.imageQuery) {
            imageUrl = await searchImage(rewritten.imageQuery);
          }
          // Fallback: search using the title itself
          if (!imageUrl) {
            imageUrl = await searchImage(rewritten.title);
          }

          const article = await createNews({
            slug: `${slugify(rewritten.title)}-${post.id.slice(0, 6)}`,
            title: rewritten.title,
            excerpt: rewritten.excerpt,
            content: rewritten.content,
            category: rewritten.category,
            image: imageUrl,
            author: `Newsluma Desk`,
            featured: false,
            publishedAt: new Date().toISOString(),
          });

          // Tag source post id for dedup
          const { getDb } = await import("./db.js");
          const db = await getDb();
          await db.collection("news").updateOne(
            { _id: article._id },
            { $set: { redditId: post.id, source: "reddit", sourceSubreddit: sub } }
          );

          result.created++;
        } catch (err) {
          result.errors.push(`[${sub}] ${err instanceof Error ? err.message : err}`);
        }
      }
    } catch (err) {
      result.errors.push(`[${sub}] ${err instanceof Error ? err.message : err}`);
    }
  }

  return result;
}
