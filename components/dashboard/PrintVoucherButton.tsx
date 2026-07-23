"use client";

import { Printer } from "lucide-react";

/** Print / save-as-PDF trigger for the credit voucher. Hidden on print. */
export function PrintVoucherButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 print:hidden"
    >
      <Printer className="size-4" />
      Descarcă PDF / Printează
    </button>
  );
}
