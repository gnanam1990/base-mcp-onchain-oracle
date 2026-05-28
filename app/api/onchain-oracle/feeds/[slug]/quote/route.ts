import { NextResponse } from "next/server";
import { paymentRequirement } from "@/lib/oracle-payment";
import { findFeed } from "@/lib/oracle-store";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const feed = findFeed(slug);
  if (!feed) {
    return NextResponse.json({ error: "feed_not_found" }, { status: 404 });
  }

  const resource = new URL(`/api/onchain-oracle/feeds/${feed.slug}/query`, request.url).toString();
  return NextResponse.json({
    data: {
      feed,
      payment: paymentRequirement(feed, resource),
    },
  });
}
