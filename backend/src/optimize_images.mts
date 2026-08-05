import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { getDb } from "./db.js";

const UPLOAD = "/root/testnews/backend/upload";
const OUT = path.join(UPLOAD, "webp");
await fs.mkdir(OUT, { recursive: true });

const db = await getDb();
const news = await db.collection("news").find({}, { projection: { slug: 1, image: 1 } }).toArray();

let done = 0, failed = 0;
for (const n of news) {
  const img = n.image || "";
  const m = img.match(/\/upload\/([a-zA-Z0-9_-]+)\.(jpe?g|png|webp)$/);
  if (!m) continue;
  const [, name] = m;
  const src = path.join(UPLOAD, `${name}.${m[2]}`);
  const out = path.join(OUT, `${name}.webp`);
  try {
    await fs.access(src);
    await sharp(src, { failOn: "none" })
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(out);
    await db.collection("news").updateOne({ _id: n._id }, { $set: { image: `/upload/webp/${name}.webp` } });
    done++;
    if (done % 150 === 0) console.log(`...${done}`);
  } catch (e) {
    failed++;
    if (failed <= 3) console.log(`FAIL ${name}: ${(e as Error).message.slice(0, 80)}`);
  }
}
console.log(`Done: ${done} optimized, ${failed} failed`);
process.exit(0);
