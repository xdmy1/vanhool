"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ExternalLink, FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

const BUCKET = "purchase-docs";
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB — supplier scans can be chunky
const ACCEPTED = "application/pdf,image/*";

/**
 * Upload-and-track widget for the supplier's original invoice on the
 * purchase form. Persists the relative storage path inside
 * `purchase-docs/` so the server action can fetch it later (signed
 * URLs expire — we want the bookkeeper email to always grab a fresh
 * copy via service-role download).
 *
 * `value` is the path currently stored on the purchase (null = none).
 * `onChange` fires with the new path after upload, or with null after
 * the user clicks "remove".
 */
export function PurchaseFileUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("Fișier prea mare (max 15 MB).");
      return;
    }
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) {
      toast.error("Doar PDF sau imagine.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      // Path is uuid-ish so two different purchases can't collide; the
      // original filename trails so the bookkeeper sees "factura-mits.pdf"
      // in their inbox rather than a random hash.
      const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
      const path = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${safe}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });
      if (error) {
        toast.error(error.message || "Upload eșuat.");
        return;
      }
      onChange(path);
      toast.success("Document atașat");
    } finally {
      setUploading(false);
    }
  };

  const filename = value ? value.split("/").pop() ?? value : null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        Factura furnizorului (PDF / imagine)
      </span>

      {value ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
          <FileText className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-xs font-mono">
            {filename}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={async () => {
              // Generate a one-hour signed URL for preview; the field
              // stays attached either way.
              const supabase = createClient();
              const { data } = await supabase.storage
                .from(BUCKET)
                .createSignedUrl(value, 3600);
              if (data?.signedUrl) {
                window.open(data.signedUrl, "_blank", "noopener,noreferrer");
              } else {
                toast.error("Nu pot deschide fișierul.");
              }
            }}
            className="gap-1 text-xs"
          >
            <ExternalLink className="size-3.5" />
            Deschide
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            disabled={uploading}
            className="gap-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={cn("w-full gap-1.5", uploading && "opacity-70")}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? "Se încarcă…" : "Încarcă factura furnizorului"}
        </Button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED}
        onChange={onPickFile}
        className="hidden"
      />

      <p className="text-[11px] text-muted">
        Atașat la emailul contabilului când apeși „Contabilului". PDF sau imagine,
        max 15&nbsp;MB.
      </p>
    </div>
  );
}
