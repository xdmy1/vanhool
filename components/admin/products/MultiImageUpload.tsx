"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 8;

/**
 * Controlled multi-image picker. Stores an array of public URLs. The first
 * image is treated as the primary (used on cards / catalog thumbnails).
 *
 * Supports:
 *  - upload one OR multiple files at once
 *  - reorder via ←/→ buttons (drag-and-drop is overkill here)
 *  - per-image delete
 *  - manual URL input as fallback
 */
export function MultiImageUpload({
  values,
  onChange,
  label,
  hint,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  label: string;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - values.length;
    if (remaining <= 0) {
      toast.error(`Maxim ${MAX_IMAGES} imagini.`);
      return;
    }
    const toUpload = files.slice(0, remaining);
    if (toUpload.length < files.length) {
      toast.warning(`Doar primele ${remaining} imagini sunt încărcate.`);
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const uploaded: string[] = [];
      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name}: doar imagini.`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name}: prea mare (max 5 MB).`);
          continue;
        }
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        });
        if (error) {
          toast.error(`${file.name}: ${error.message || "upload eșuat"}`);
          continue;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      if (uploaded.length > 0) {
        onChange([...values, ...uploaded]);
        toast.success(`${uploaded.length} imagine(i) încărcate`);
      }
    } finally {
      setUploading(false);
    }
  };

  const move = (idx: number, delta: -1 | 1) => {
    const next = [...values];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };
  const removeAt = (idx: number) => onChange(values.filter((_, i) => i !== idx));
  const addManual = () => {
    const u = manualUrl.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) {
      toast.error("URL invalid.");
      return;
    }
    if (values.length >= MAX_IMAGES) {
      toast.error(`Maxim ${MAX_IMAGES} imagini.`);
      return;
    }
    onChange([...values, u]);
    setManualUrl("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted">{label}</span>
        <span className="font-mono text-[10px] text-muted">
          {values.length} / {MAX_IMAGES}
        </span>
      </div>

      {values.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {values.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-contain"
              />
              {i === 0 ? (
                <span className="absolute left-1 top-1 rounded-sm bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground">
                  primar
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="grid size-5 place-items-center rounded text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                  aria-label="Mută stânga"
                >
                  <ArrowLeft className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === values.length - 1}
                  className="grid size-5 place-items-center rounded text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                  aria-label="Mută dreapta"
                >
                  <ArrowRight className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="grid size-5 place-items-center rounded text-white/80 transition-colors hover:bg-destructive hover:text-white"
                  aria-label="Șterge"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </li>
          ))}
          {values.length < MAX_IMAGES ? (
            <li>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className={cn(
                  "grid aspect-square w-full place-items-center rounded-md border border-dashed border-border bg-surface text-muted transition-colors hover:border-primary/50 hover:text-primary",
                  uploading && "opacity-60",
                )}
                aria-label="Adaugă imagine"
              >
                {uploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ImagePlus className="size-5" />
                )}
              </button>
            </li>
          ) : null}
        </ul>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-surface px-4 py-6 text-sm text-muted transition-colors hover:border-primary/50 hover:text-primary",
            uploading && "opacity-60",
          )}
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Upload className="size-6" />
          )}
          <span>{uploading ? "Se încarcă..." : "Click pentru a încărca imagini"}</span>
          <span className="text-[10px] text-muted">JPG / PNG / WebP, max 5 MB fiecare, până la {MAX_IMAGES}</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onPickFiles}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <input
          type="url"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addManual();
            }
          }}
          placeholder="https://… (URL extern)"
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={addManual}
          disabled={!manualUrl.trim() || values.length >= MAX_IMAGES}
        >
          Adaugă URL
        </Button>
      </div>

      {hint ? <p className="text-[10px] text-muted">{hint}</p> : null}
    </div>
  );
}
