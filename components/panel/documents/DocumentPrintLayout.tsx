/**
 * Shared print-friendly layout used by /panel/proforme/[id]/print,
 * /panel/facturi/[id]/print and /panel/achizitii/[id]/po. Strips browser
 * chrome via @page margin:0; adds pattern watermark; ensures table borders
 * print uniformly.
 */
export function DocumentPrintShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="doc-print-root min-h-dvh bg-white text-black">
      <style>{`
        @page { size: A4; margin: 0; }
        /* Nuke parent panel chrome whenever a print shell renders, on-screen
           AND while printing. Uses :has() so the parent panel layout's
           standalone detection isn't load-bearing — if we render, chrome dies. */
        [data-panel-chrome] { display: none !important; }
        /* Sonner toasts (mounted on body) bleed into the printable area and
           leak from the previous page after redirect — kill them on doc routes. */
        html:has(.doc-print-root) [data-sonner-toaster],
        html:has(.doc-print-root) [data-sonner-toast] { display: none !important; }
        html:has(.doc-print-root) body { background: #f3f4f6 !important; }
        @media print {
          html, body { background: white !important; }
          .no-print { display: none !important; }
          /* Stretch the sheet to fill A4 so the in-sheet watermark covers
             the visible content area. */
          .doc-sheet {
            padding: 12mm 12mm !important;
            min-height: 297mm !important;
            box-sizing: border-box !important;
          }
          /* Bullet-proof page coverage: a fixed-position pseudo-element on
             body repeats on every printed page in Chrome/Edge/Safari, so the
             pattern fills every sheet end-to-end even for multi-page docs. */
          html:has(.doc-print-root) body::before {
            content: "";
            position: fixed;
            inset: 0;
            background-image: url('/pattern.svg');
            background-repeat: repeat;
            background-size: 220px 200px;
            opacity: 0.05;
            pointer-events: none;
            z-index: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .doc-watermark { display: none !important; }
        }
        .doc-sheet { color: #000; position: relative; }
        .doc-watermark {
          position: absolute;
          inset: 0;
          background-image: url('/pattern.svg');
          background-repeat: repeat;
          background-size: 220px 200px;
          opacity: 0.05;
          pointer-events: none;
          z-index: 0;
        }
        .doc-sheet > *:not(.doc-watermark) { position: relative; z-index: 1; }
        .doc-sheet table.items { border-collapse: collapse; width: 100%; }
        .doc-sheet table.items th, .doc-sheet table.items td {
          border: 1px solid #e2e2e2;
          padding: 8px 10px;
          font-size: 12px;
          text-align: left;
          vertical-align: top;
        }
        .doc-sheet table.items th {
          background: #000;
          color: #fff;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.02em;
        }
        .doc-sheet table.items td.num,
        .doc-sheet table.items th.num {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .doc-sheet .doc-box {
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          border-radius: 6px;
          padding: 14px 16px;
          font-size: 12px;
        }
      `}</style>
      {children}
    </div>
  );
}
