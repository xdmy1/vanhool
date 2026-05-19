/**
 * Print-only layout. Strips down to bare <body> output for the print page —
 * no sidebar, no topbar. Browser-injected page headers/footers (URL,
 * timestamp) are suppressed via `@page { margin: 0 }`; padding is applied
 * inside the document so content doesn't touch the paper edge.
 */
export default function DeliveryNotePrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="delivery-print-root min-h-dvh bg-white text-black">
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        /* Hide panel chrome whenever the delivery-note print shell renders. */
        [data-panel-chrome] { display: none !important; }
        /* Suppress sonner toasts on the print preview — they leak from the
           previous page after the auto-redirect and look out of place. */
        html:has(.delivery-print-root) [data-sonner-toaster],
        html:has(.delivery-print-root) [data-sonner-toast] { display: none !important; }
        html:has(.delivery-print-root) body { background: #f3f4f6 !important; }
        @media print {
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .delivery-sheet { padding: 14mm 12mm !important; }
          /* keep the watermark visible when printing */
          .delivery-watermark { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .delivery-sheet { color: #000; position: relative; }
        .delivery-watermark {
          position: absolute;
          inset: 0;
          background-image: url('/pattern.svg');
          background-repeat: repeat;
          background-size: 220px 200px;
          opacity: 0.06;
          pointer-events: none;
          z-index: 0;
        }
        .delivery-sheet > *:not(.delivery-watermark) { position: relative; z-index: 1; }
        .delivery-sheet table { border-collapse: collapse; width: 100%; }
        .delivery-sheet th, .delivery-sheet td {
          border: 1px solid #000;
          padding: 6px 8px;
          font-size: 12px;
          text-align: left;
        }
        .delivery-sheet th { background: #f3f3f3; font-weight: 600; }
        .delivery-sheet td.num, .delivery-sheet th.num { text-align: right; font-variant-numeric: tabular-nums; }
      `}</style>
      {children}
    </div>
  );
}
