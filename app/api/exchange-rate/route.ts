import { NextResponse } from "next/server";

import { getEurToMdlRate } from "@/lib/exchange-rate";

/**
 * GET /api/exchange-rate
 * Returns the official EUR → MDL rate (MDL per 1 EUR). Cached upstream by
 * the fetch() inside `getEurToMdlRate` (6h revalidate). Response cache:
 * 1h on edge / 24h s-maxage so CDNs hold the value too.
 */
export async function GET() {
  const rate = await getEurToMdlRate();
  return NextResponse.json(
    { ok: true, ...rate },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    },
  );
}
