import { NextResponse } from "next/server";
import { addObservation } from "@/lib/oracle-store";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function confidence(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0.8;
  }
  return Math.max(0, Math.min(1, parsed));
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const body = (await request.json()) as {
    value?: string;
    confidence?: number | string;
    sourceTx?: string;
  };

  const result = addObservation(slug, {
    value: body.value?.trim() || "demo observation",
    confidence: confidence(body.confidence),
    sourceTx: body.sourceTx?.trim(),
  });

  if (!result) {
    return NextResponse.json({ error: "feed_not_found" }, { status: 404 });
  }

  return NextResponse.json({ data: result }, { status: 201 });
}
