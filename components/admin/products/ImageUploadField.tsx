"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function ImageUploadField({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue?: string | null;
  label: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Doar imagini.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Fișier prea mare (max 5 MB).");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });
      if (error) {
        toast.error(error.message || "Upload eșuat.");
        return;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setUrl(data.publicUrl);
      toast.success("Imagine încărcată");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted">{label}</span>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={cn(
            "relative grid aspect-square w-28 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-surface",
            uploading && "opacity-60",
          )}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="h-full w-full object-contain"
              onError={() => {
                /* preview fails silently — user still sees the URL */
              }}
            />
          ) : (
            <ImagePlus className="size-7 text-muted" />
          )}
          {uploading ? (
            <Loader2 className="absolute size-6 animate-spin text-primary" />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="gap-1.5"
            >
              <Upload className="size-4" />
              {uploading ? "Se încarcă…" : "Încarcă imagine"}
            </Button>
            {url ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUrl("")}
                disabled={uploading}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
                Șterge
              </Button>
            ) : null}
          </div>

          <Input
            name={name}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… sau încarcă o imagine"
            inputMode="url"
            autoComplete="off"
          />

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPickFile}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
