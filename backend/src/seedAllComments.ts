// One-off: seed comments for all existing news articles that have none
import { getDb, seedCommentsForNews } from "./db.js";

const db = await getDb();
const news = await db.collection("news").find({}, { projection: { slug: 1 } }).toArray();
let seeded = 0;
for (const n of news) {
  const before = await db.collection("comments").countDocuments({ newsSlug: n.slug });
  if (before === 0) {
    await seedCommentsForNews(n.slug);
    seeded++;
  }
}
console.log(`Done. Seeded comments for ${seeded}/${news.length} articles.`);
process.exit(0);
