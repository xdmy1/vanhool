import { NextRequest, NextResponse } from "next/server";
import { listModelsByMake } from "@/lib/db/vehicles";

// GET /api/debug-brand?slug=audi
// Temporary diagnostic — returns raw output or error from listModelsByMake.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "audi";
  try {
    const result = await listModelsByMake(slug);
    return NextResponse.json({
      ok: true,
      slug,
      result_summary: result
        ? {
            make: result.make,
            modelCount: result.models.length,
            firstModels: result.models.slice(0, 3),
          }
        : null,
    });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json(
      {
        ok: false,
        slug,
        error: {
          name: err?.name,
          message: err?.message,
          stack: err?.stack?.split("\n").slice(0, 8),
          cause: err?.cause ? String(err.cause) : undefined,
        },
      },
      { status: 500 },
    );
  }
}
