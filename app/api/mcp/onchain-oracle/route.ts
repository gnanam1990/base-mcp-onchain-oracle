import { NextResponse } from "next/server";
import projectData from "@/lib/project-data.json";
import { findFeed, listFeeds, oracleStats } from "@/lib/oracle-store";

const tools = [
  ...projectData.tools,
  "list_oracle_feeds",
  "get_feed_quote",
  "prepare_feed_query",
  "get_oracle_stats",
];

export function GET() {
  return NextResponse.json({
    server: "onchain-oracle-mcp",
    version: "0.1.0",
    tools,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    tool?: string;
    arguments?: {
      query?: string;
      slug?: string;
    };
  };

  switch (body.tool) {
    case "get_token_metrics":
    case "get_whale_alerts":
    case "get_yield_rankings":
    case "get_protocol_health":
    case "list_oracle_feeds": {
      const query = body.arguments?.query?.toLowerCase() ?? "";
      const feeds = listFeeds().filter((feed) =>
        [feed.name, feed.category, feed.description, feed.source].some((value) => value.toLowerCase().includes(query)),
      );
      return NextResponse.json({ data: feeds });
    }
    case "get_feed_quote": {
      const feed = body.arguments?.slug ? findFeed(body.arguments.slug) : undefined;
      if (!feed) {
        return NextResponse.json({ error: "feed_not_found" }, { status: 404 });
      }
      return NextResponse.json({
        data: {
          slug: feed.slug,
          priceUsdc: feed.priceUsdc,
          resource: `/api/onchain-oracle/feeds/${feed.slug}/query`,
          network: process.env.ORACLE_X402_NETWORK || "eip155:84532",
        },
      });
    }
    case "prepare_feed_query": {
      const feed = body.arguments?.slug ? findFeed(body.arguments.slug) : undefined;
      if (!feed) {
        return NextResponse.json({ error: "feed_not_found" }, { status: 404 });
      }
      return NextResponse.json({
        data: {
          method: "POST",
          resource: `/api/onchain-oracle/feeds/${feed.slug}/query`,
          maxPayment: `${feed.priceUsdc.toFixed(3)} USDC`,
        },
      });
    }
    case "get_oracle_stats":
      return NextResponse.json({ data: oracleStats() });
    default:
      return NextResponse.json({ error: "unknown_tool" }, { status: 400 });
  }
}
