import { NextResponse } from "next/server";
import { dashboardData, oracleStats } from "@/lib/oracle-store";

export function GET() {
  return NextResponse.json({
    data: dashboardData(),
    stats: oracleStats(),
    status: "mvp_foundation_ready",
  });
}
