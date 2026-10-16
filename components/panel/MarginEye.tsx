"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * The "eye" that hides every admin-only cost / margin / profit figure in the
 * panel. Clients often sit at the desk and read the screen, so the figures
 * are HIDDEN by default and only show while the eye is open.
 *
 * Mechanism (works for server components too, no prop drilling): every
 * sensitive element carries `data-margin`; globals.css hides it unless
 * `<html>` carries `data-show-margin`. The choice is remembered per browser
 * (localStorage) and applied before first paint by MARGIN_EYE_BOOT_SCRIPT in
 * the panel layout, so a reload never flashes the numbers. All eyes on the
 * page (topbar + document pages) stay in sync, across tabs too.
 */
const STORAGE_KEY = "ib-panel-show-margin";
const ATTR = "data-show-margin";
const EVENT = "ib-margin-visibility";

/** Inline script for the panel layout: apply the remembered choice pre-paint. */
export const MARGIN_EYE_BOOT_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)})==="1")document.documentElement.setAttribute(${JSON.stringify(ATTR)},"")}catch(e){}`;

function applyAttr(visible: boolean): void {
  const el = document.documentElement;
  if (visible) el.setAttribute(ATTR, "");
  else el.removeAttribute(ATTR);
  window.dispatchEvent(new Event(EVENT));
}

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setMarginVisible(visible: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, visible ? "1" : "0");
  } catch {
    // Private mode / blocked storage: the toggle still works for this page.
  }
  applyAttr(visible);
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) applyAttr(e.newValue === "1");
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => document.documentElement.hasAttribute(ATTR);
const getServerSnapshot = () => false;

export function MarginEye({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Reaching the panel by client-side navigation skips the boot script —
  // bring the attribute in line with the remembered choice.
  useEffect(() => {
    const stored = readStored();
    if (stored !== document.documentElement.hasAttribute(ATTR)) applyAttr(stored);
  }, []);

  const label = visible ? "Ascunde costul și marja" : "Arată costul și marja";
  const Icon = visible ? Eye : EyeOff;
  return (
    <button
      type="button"
      onClick={() => setMarginVisible(!visible)}
      aria-pressed={visible}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border transition-colors",
        size === "sm" ? "size-7" : "size-9",
        visible
          ? "border-warning/50 bg-warning/15 text-warning hover:bg-warning/25"
          : "border-border bg-surface text-muted hover:bg-surface-elevated hover:text-foreground",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} />
    </button>
  );
}
