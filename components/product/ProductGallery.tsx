"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { PartImage } from "@/components/common/PartImage";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/lib/db/types";

export function ProductGallery({ product }: { product: Product }) {
  // Use the real list of admin-uploaded images. If empty, fall back to the
  // single primary imageUrl (which gets wrapped in an array by toProduct in
  // most cases). No more fake duplicates.
  const images =
    product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const showThumbs = images.length > 1;

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const activeImage = images[activeIdx] ?? product.imageUrl;

  // ESC closes the lightbox; arrows navigate when multiple images exist.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight" && images.length > 1)
        setActiveIdx((i) => (i + 1) % images.length);
      else if (e.key === "ArrowLeft" && images.length > 1)
        setActiveIdx((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, images.length]);

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-start">
        <button
          type="button"
          onClick={() => images.length > 0 && setLightbox(true)}
          className={cn(
            "relative aspect-square w-full overflow-hidden rounded-md border border-border bg-surface transition-shadow",
            images.length > 0 && "cursor-zoom-in hover:shadow-[var(--shadow-elevated)]",
          )}
          aria-label={images.length > 0 ? "Mărește imaginea" : product.name}
          disabled={images.length === 0}
        >
          <PartImage
            variant={product.illustration}
            imageUrl={activeImage}
            alt={product.name}
          />
          <div className="absolute left-4 top-4 rounded-sm border border-border bg-background/80 px-2 py-1 text-xs text-muted-strong backdrop-blur">
            {product.partCode || product.slug}
          </div>
        </button>

        {showThumbs ? (
          <div className="grid grid-cols-4 gap-2 lg:w-20 lg:grid-cols-1">
            {images.map((url, i) => (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-md border bg-surface transition-colors",
                  i === activeIdx
                    ? "border-primary"
                    : "border-border hover:border-primary/60",
                )}
                aria-label={`Imaginea ${i + 1}`}
              >
                <PartImage
                  variant={product.illustration}
                  imageUrl={url}
                  alt={product.name}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Închide"
          >
            <X className="size-5" />
          </button>

          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage ?? ""}
              alt={product.name}
              className="max-h-[90vh] max-w-[90vw] rounded-md object-contain"
            />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
                  aria-label="Anterioara"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIdx((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
                  aria-label="Următoarea"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 font-mono text-xs text-white">
                  {activeIdx + 1} / {images.length}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
