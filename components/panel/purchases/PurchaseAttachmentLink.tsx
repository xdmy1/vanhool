"use client";

import { useState } from "react";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * Read-only attachment chip for the purchase detail page. Holds the
 * storage path (private bucket), mints a fresh 1h signed URL on
 * click, and opens the file in a new tab. Lives client-side so we
 * don't bake short-lived URLs into server-rendered HTML.
 */
export function PurchaseAttachmentLink({ path }: { path: string }) {
  const [opening, setOpening] = useState(false);
  const filename = path.split("/").pop() ?? path;

  async function open() {
    setOpening(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("purchase-docs")
        .createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) {
        toast.error(error?.message ?? "Nu pot deschide fișierul.");
        return;
      }
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } finally {
      setOpening(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={open}
      disabled={opening}
      className="gap-1.5"
      title={filename}
    >
      {opening ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileText className="size-4" />
      )}
      <span className="max-w-[180px] truncate text-xs">{filename}</span>
      <ExternalLink className="size-3.5 text-muted" />
    </Button>
  );
}
