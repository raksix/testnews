import { NextRequest, NextResponse } from "next/server";
import { createNews, slugify } from "@/lib/db";

const ADMIN_KEY = process.env.ADMIN_KEY || "testnews-admin-2026";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (request.headers.get("x-admin-key") !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const news = await createNews({
      slug: body.slug || slugify(body.title),
      title: body.title,
      excerpt: body.excerpt || "",
      content: body.content || "",
      category: body.category || "World",
      image: body.image || "",
      author: body.author || "News Desk",
      featured: Boolean(body.featured),
      publishedAt: body.publishedAt || new Date().toISOString(),
    });
    return NextResponse.json({ news }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
