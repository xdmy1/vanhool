"use client";

import { useEffect } from "react";
import { Download, Printer } from "lucide-react";

/**
 * Auto-print or auto-download on mount. Both paths route through
 * `window.print()` — the browser's print dialog lets the user pick a
 * physical printer OR "Save as PDF" as the destination, which produces a
 * text-selectable PDF that matches the on-screen rendering exactly. The
 * previous html2canvas-based PDF export produced garbled output with
 * washed-out colors and broken layout, so we no longer try to roll our
 * own raster→PDF pipeline.
 */
export function AutoPrintGeneric({
  auto,
  autoDownload,
}: {
  auto: boolean;
  autoDownload?: boolean;
  // `filename` is ignored — the browser controls the filename when saving
  // from the print dialog. Kept on the signature so callers don't break.
  filename?: string;
}) {
  useEffect(() => {
    if (!auto && !autoDownload) return;
    const t = window.setTimeout(() => window.print(), 600);
    return () => window.clearTimeout(t);
  }, [auto, autoDownload]);
  return null;
}

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      <Printer className="size-4" />
      {label}
    </button>
  );
}

/**
 * The "Save as PDF" button. Triggers the browser's print dialog where the
 * user picks "Save as PDF" as the destination — same mechanism Refrens /
 * Gmail / banking apps use, and the resulting PDF is text-selectable +
 * matches the screen pixel-for-pixel.
 */
export function DownloadPDFButton({
  label,
}: {
  filename?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded border border-black bg-white px-5 py-2 text-sm font-medium text-black hover:bg-gray-100"
      title={`Va deschide dialogul de printare. Alege „Salvează ca PDF" la destinație.`}
    >
      <Download className="size-4" />
      {label}
    </button>
  );
}
