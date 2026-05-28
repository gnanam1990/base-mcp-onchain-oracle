import { NextResponse } from "next/server";
import { createFeed, listFeeds } from "@/lib/oracle-store";

function numeric(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function GET() {
  return NextResponse.json({ data: listFeeds() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    category?: string;
    description?: string;
    source?: string;
    priceUsdc?: number | string;
  };

  const feed = createFeed({
    name: body.name?.trim() || "Untitled Oracle Feed",
    category: body.category?.trim() || "Metrics",
    description: body.description?.trim() || "Base oracle feed awaiting description.",
    source: body.source?.trim() || "Base demo worker",
    priceUsdc: numeric(body.priceUsdc, 0.003),
  });

  return NextResponse.json({ data: feed }, { status: 201 });
}
