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

const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "https://omniroute.fermag.com.tr/v1";
const OMNIROUTE_KEY = process.env.OMNIROUTE_KEY || "";

import { readFileSync, existsSync } from "node:fs";

interface RedditToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
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
}> {
  const settings = await getSettings();
  const model = settings.reddit.model;

  const prompt = `You are a news editor for an English news website. Rewrite this Reddit post into a proper news article.

SOURCE (from r/${subreddit}):
TITLE: ${title}
BODY: ${(selftext || "(no body text — expand from the title)").slice(0, 4000)}

RULES:
- Write in ENGLISH
- Create an engaging news headline (max 12 words)
- Write a 2-3 sentence summary (excerpt)
- Write a full article of 4-6 short paragraphs (## headings allowed, keep it structured)
- Be factual and neutral — do NOT mention Reddit, the subreddit, usernames, or "Reddit user"
- Treat it as original reporting
- Category must be exactly one of: World, Technology, Business, Sports, Science, Health, Entertainment

Respond with ONLY valid JSON (no markdown fences):
{"title":"...","excerpt":"...","content":"...","category":"..."}`;

  const res = await fetch(`${OMNIROUTE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OMNIROUTE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a professional news editor. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1200,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error(`AI API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";

  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      title: parsed.title || title,
      excerpt: parsed.excerpt || "",
      content: parsed.content || "",
      category: parsed.category || "Technology",
    };
  } catch {
    // Fallback: use raw output as content
    return { title, excerpt: "", content: text, category: "Technology" };
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
        if (post.is_self === false && !post.selftext) continue; // skip pure link/image posts without body
        const ageMs = Date.now() - post.created_utc * 1000;
        if (ageMs > cfg.maxAgeHours * 3600_000) continue;

        if (await redditPostExists(post.id)) {
          result.skipped++;
          continue;
        }

        try {
          const rewritten = await aiRewrite(post.title, post.selftext || "", sub);

          const article = await createNews({
            slug: `${slugify(rewritten.title)}-${post.id.slice(0, 6)}`,
            title: rewritten.title,
            excerpt: rewritten.excerpt,
            content: rewritten.content,
            category: rewritten.category,
            image: post.url && (post.url.startsWith("http") && !post.is_self) ? post.url : "",
            author: `r/${sub} via TestNews AI`,
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
