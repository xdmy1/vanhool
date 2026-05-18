"use client";

import { useEffect } from "react";

export function AutoPrintGeneric({ auto }: { auto: boolean }) {
  useEffect(() => {
    if (!auto) return;
    const t = window.setTimeout(() => window.print(), 600);
    return () => window.clearTimeout(t);
  }, [auto]);
  return null;
}

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      {label}
    </button>
  );
}
