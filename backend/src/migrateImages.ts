// Migrate all base64 data-URI images to real files under upload/
// and update each article's image field to /upload/<file>
import { getDb, saveImageToFile } from "./db.js";

const db = await getDb();
const news = await db.collection("news").find({}, { projection: { slug: 1, image: 1 } }).toArray();

let migrated = 0;
let skipped = 0;
for (const n of news) {
  if (!n.image || !n.image.startsWith("data:")) {
    skipped++;
    continue;
  }
  try {
    const url = await saveImageToFile(n.image, n.slug || `post-${Date.now()}`);
    await db.collection("news").updateOne({ _id: n._id }, { $set: { image: url } });
    migrated++;
    if (migrated % 100 === 0) console.log(`...${migrated}`);
  } catch (e) {
    console.log(`FAILED ${n.slug}: ${(e as Error).message}`);
  }
}
console.log(`Done. Migrated ${migrated}, skipped ${skipped} (already URLs).`);
process.exit(0);
