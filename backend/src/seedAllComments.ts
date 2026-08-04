// Regenerate comments with topic/category-aware texts:
// delete all seeded comments and re-seed from news title + category
import { getDb, seedCommentsForNews } from "./db.js";

const db = await getDb();
const news = await db.collection("news").find({}, { projection: { slug: 1, title: 1, category: 1 } }).toArray();

// Delete existing comments (site is new; user-posted comments would be lost —
// acceptable for this regeneration pass)
const deleted = await db.collection("comments").deleteMany({});
console.log(`Deleted ${deleted.deletedCount} existing comments.`);

let seeded = 0;
for (const n of news) {
  await seedCommentsForNews(n.slug, n.title, n.category);
  seeded++;
}
const total = await db.collection("comments").countDocuments();
console.log(`Done. Regenerated comments for ${seeded} articles (total ${total}).`);
process.exit(0);
