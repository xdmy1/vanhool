"use client";

import { useEffect } from "react";

import { markPrinted } from "@/lib/panel/delivery_notes/actions";

export function AutoPrint({ noteId, auto }: { noteId: string; auto: boolean }) {
  useEffect(() => {
    if (!auto) return;
    const t = window.setTimeout(() => {
      window.print();
      // Mark as printed in the background — non-blocking for the user
      markPrinted(noteId).catch(() => {});
    }, 600);
    return () => window.clearTimeout(t);
  }, [auto, noteId]);
  return null;
}

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      Printează
    </button>
  );
}
