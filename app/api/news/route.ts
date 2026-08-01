import { NextRequest, NextResponse } from "next/server";
import { listNews, getFeatured, countByCategory } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);
  const offset = Number(searchParams.get("offset") || 0);
  const featured = searchParams.get("featured") === "1";

  try {
    if (featured) {
      const items = await getFeatured();
      return NextResponse.json({ news: items });
    }
    const [news, categories] = await Promise.all([
      listNews(category, limit, offset),
      countByCategory(),
    ]);
    return NextResponse.json({ news, categories });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
