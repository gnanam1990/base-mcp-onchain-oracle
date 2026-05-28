import { NextResponse } from "next/server";
import { paymentRequiredBody, verifyOraclePayment } from "@/lib/oracle-payment";
import { feedObservations, findFeed, recordPaidQuery } from "@/lib/oracle-store";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const feed = findFeed(slug);
  if (!feed) {
    return NextResponse.json({ error: "feed_not_found" }, { status: 404 });
  }

  const resource = new URL(`/api/onchain-oracle/feeds/${feed.slug}/query`, request.url).toString();
  const verification = await verifyOraclePayment(request, feed, resource);
  if (!verification.ok) {
    const body = paymentRequiredBody(feed, resource);
    return NextResponse.json({ ...body, reason: verification.reason }, { status: 402 });
  }

  const receipt = recordPaidQuery(feed.slug, {
    network: verification.network,
    paymentMode: verification.mode,
    paymentPayloadHash: verification.paymentPayloadHash,
    facilitatorReference: verification.facilitatorReference,
  });

  const response = NextResponse.json({
    data: {
      feed: {
        slug: feed.slug,
        name: feed.name,
        category: feed.category,
        freshnessSeconds: feed.freshnessSeconds,
        payload: feed.payload,
      },
      observations: feedObservations(feed.slug),
    },
    receipt,
  });

  if (verification.paymentResponse) {
    response.headers.set("payment-response", verification.paymentResponse);
  }

  return response;
}
