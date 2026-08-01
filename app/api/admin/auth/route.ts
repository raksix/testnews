import { NextRequest, NextResponse } from "next/server";

const ADMIN_KEY = process.env.ADMIN_KEY || "testnews-admin-2026";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (body.key === ADMIN_KEY) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Invalid key" }, { status: 401 });
}
