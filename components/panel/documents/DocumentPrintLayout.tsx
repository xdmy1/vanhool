/**
 * Shared print-friendly layout used by /panel/proforme/[id]/print,
 * /panel/facturi/[id]/print and /panel/achizitii/[id]/po. Strips browser
 * chrome via @page margin:0; adds pattern watermark; ensures table borders
 * print uniformly.
 */
export function DocumentPrintShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white text-black">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .doc-sheet { padding: 12mm 12mm !important; }
          .doc-watermark { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
          background: #5b4fc4;
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
          background: #efeafd;
          border-radius: 6px;
          padding: 14px 16px;
          font-size: 12px;
        }
      `}</style>
      {children}
    </div>
  );
}
