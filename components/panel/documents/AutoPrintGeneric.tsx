"use client";

import { useEffect, useTransition } from "react";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

/**
 * Generate a single-page A4 PDF from the `.doc-sheet` element on the page.
 * jsPDF + html2canvas-pro are dynamic-imported so they only land in the
 * bundle when the user actually clicks Download.
 */
async function buildPdf(filename: string): Promise<void> {
  // Match both the generic `.doc-sheet` and the delivery note's
  // `.delivery-sheet` so any printable document on the page is captured.
  const target = document.querySelector(
    ".doc-sheet, .delivery-sheet",
  ) as HTMLElement | null;
  if (!target) {
    toast.error("Nu găsesc documentul pe pagină");
    return;
  }

  const [{ default: jsPDF }, html2canvas] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro").then((m) => m.default),
  ]);

  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "p" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const data = canvas.toDataURL("image/jpeg", 0.95);

  if (imgHeight <= pageHeight) {
    pdf.addImage(data, "JPEG", 0, 0, imgWidth, imgHeight);
  } else {
    // Multi-page: stack the same image down with negative offsets so each
    // page shows the corresponding strip of the canvas.
    let position = 0;
    let remaining = imgHeight;
    while (remaining > 0) {
      pdf.addImage(data, "JPEG", 0, position, imgWidth, imgHeight);
      remaining -= pageHeight;
      if (remaining > 0) {
        pdf.addPage();
        position -= pageHeight;
      }
    }
  }
  pdf.save(`${filename}.pdf`);
}

export function AutoPrintGeneric({
  auto,
  autoDownload,
  filename,
}: {
  auto: boolean;
  autoDownload?: boolean;
  filename?: string;
}) {
  useEffect(() => {
    if (autoDownload && filename) {
      const t = window.setTimeout(() => {
        buildPdf(filename).catch((e) => {
          console.error(e);
          toast.error("PDF generation failed");
        });
      }, 500);
      return () => window.clearTimeout(t);
    }
    if (auto) {
      const t = window.setTimeout(() => window.print(), 600);
      return () => window.clearTimeout(t);
    }
  }, [auto, autoDownload, filename]);
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

export function DownloadPDFButton({
  filename,
  label,
}: {
  filename: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  function go() {
    startTransition(async () => {
      try {
        await buildPdf(filename);
        toast.success(`${filename}.pdf`);
      } catch (e) {
        console.error(e);
        toast.error("PDF generation failed — vezi consola");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded border border-black px-5 py-2 text-sm font-medium text-black hover:bg-gray-100 disabled:opacity-50"
    >
      <Download className="size-4" />
      {pending ? "Generez..." : label}
    </button>
  );
}
