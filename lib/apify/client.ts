import "server-only";

import { getApifyConfig, type ApifyConfig } from "./config";

export type ApifyRunResult<T = unknown> = {
  items: T[];
  /** Run metadata returned by Apify (id, status, computeUnits, …). */
  meta: {
    runId: string | null;
    status: string | null;
    computeUnits: number | null;
    actorId: string;
  };
};

export class ApifyError extends Error {
  status: number;
  detail?: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApifyError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Run an Apify actor synchronously and return its dataset items.
 *
 * Uses the run-sync-get-dataset-items endpoint, which blocks until the run
 * finishes (or until `timeoutSec`) and returns the produced dataset directly,
 * so we don't have to poll.
 *
 * Docs: https://docs.apify.com/api/v2#/reference/actors/run-actor-synchronously-and-get-dataset-items
 */
export async function runActorSync<T = unknown>(opts: {
  actorId: string;
  input: Record<string, unknown>;
  timeoutSec?: number;
  memoryMb?: number | null;
  /** Override config (useful in tests). */
  config?: ApifyConfig;
}): Promise<ApifyRunResult<T>> {
  const cfg = opts.config ?? getApifyConfig();
  const actorPath = encodeURIComponent(opts.actorId).replace(/%2F/gi, "~");
  const params = new URLSearchParams({
    token: cfg.token,
    timeout: String(opts.timeoutSec ?? cfg.tecdoc.timeoutSec),
    format: "json",
  });
  if (opts.memoryMb && opts.memoryMb > 0) {
    params.set("memory", String(opts.memoryMb));
  }

  const url = `${cfg.baseUrl}/acts/${actorPath}/run-sync-get-dataset-items?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(opts.input),
      // Server-only — never cache; results go through our own DB cache.
      cache: "no-store",
    });
  } catch (cause) {
    throw new ApifyError(
      `Apify request failed: ${cause instanceof Error ? cause.message : "unknown error"}`,
      0,
      cause,
    );
  }

  // Apify echoes the run ID, status and CU usage in response headers.
  const runId = res.headers.get("x-apify-run-id");
  const status = res.headers.get("x-apify-run-status");
  const cuRaw = res.headers.get("x-apify-compute-units-used");
  const computeUnits = cuRaw ? Number(cuRaw) : null;

  if (!res.ok) {
    let detail: unknown = await res.text().catch(() => null);
    if (detail && typeof detail === "string") {
      try {
        detail = JSON.parse(detail);
      } catch {
        // keep as text
      }
    }
    throw new ApifyError(
      `Apify ${opts.actorId} returned ${res.status}`,
      res.status,
      detail,
    );
  }

  const items = (await res.json()) as T[];
  return {
    items: Array.isArray(items) ? items : [],
    meta: {
      runId,
      status,
      computeUnits: Number.isFinite(computeUnits) ? computeUnits : null,
      actorId: opts.actorId,
    },
  };
}
