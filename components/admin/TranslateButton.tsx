"use client";

import { useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Lang = "ro" | "en" | "ru";

type LangValues = { ro: string; en: string; ru: string };

const LANG_LABEL: Record<Lang, string> = { ro: "RO", en: "EN", ru: "RU" };

/**
 * Auto-translate the two empty locale fields from whichever one has content.
 *
 * Behavior:
 *   - 0 fields filled → button hidden (nothing to translate from).
 *   - 1 field filled  → button reads `Traduce din {LANG}` and on click fills
 *     the other 2 via /api/translate.
 *   - 2-3 filled       → small picker chooses the source, then translates.
 *
 * Filled locales are NEVER overwritten; only blanks are filled in. This
 * lets a user pre-edit one language without losing their work.
 */
export function TranslateButton({
  values,
  onTranslated,
  className,
  size = "sm",
}: {
  values: LangValues;
  onTranslated: (next: LangValues) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const [pending, setPending] = useState(false);
  const [picking, setPicking] = useState(false);

  const filled: Lang[] = (["ro", "en", "ru"] as Lang[]).filter(
    (l) => values[l].trim().length > 0,
  );

  if (filled.length === 0) return null;

  const run = async (source: Lang) => {
    setPicking(false);
    const text = values[source].trim();
    if (!text) return;
    setPending(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, text }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        translations?: Partial<Record<Lang, string>>;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.translations) {
        toast.error(json.error ?? "translate_failed");
        return;
      }
      // Fill only empty locales — preserve any manual edits.
      const next: LangValues = { ...values };
      for (const l of ["ro", "en", "ru"] as Lang[]) {
        if (l === source) continue;
        const translated = json.translations[l]?.trim() ?? "";
        if (translated && !next[l].trim()) {
          next[l] = translated;
        } else if (translated && next[l].trim()) {
          // Field had content — only overwrite if user explicitly asks
          // (i.e. picked this as source and the other locales were empty).
          // For now, skip — they can clear it and retranslate.
        }
      }
      onTranslated(next);
    } catch {
      toast.error("translate_failed");
    } finally {
      setPending(false);
    }
  };

  // If more than one is filled, show a tiny picker on click.
  const onMainClick = () => {
    if (filled.length === 1) {
      run(filled[0]);
    } else {
      setPicking((p) => !p);
    }
  };

  return (
    <div className={`relative inline-flex ${className ?? ""}`}>
      <Button
        type="button"
        size={size}
        variant="ghost"
        onClick={onMainClick}
        disabled={pending}
        className="gap-1.5"
        aria-label="Auto-translate"
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Languages className="size-3.5" />
        )}
        {filled.length === 1
          ? `Traduce din ${LANG_LABEL[filled[0]]}`
          : "Traduce"}
      </Button>
      {picking ? (
        <div
          className="absolute right-0 top-full z-50 mt-1 flex flex-col rounded-md border border-border bg-surface p-1 shadow-md"
          onMouseLeave={() => setPicking(false)}
        >
          <span className="px-2 pb-1 pt-0.5 text-[10px] uppercase tracking-wider text-muted">
            Sursă
          </span>
          {filled.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => run(l)}
              className="rounded-sm px-2 py-1 text-left text-xs hover:bg-accent"
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
