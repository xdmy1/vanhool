import { PartImage } from "@/components/common/PartImage";
import type { Product } from "@/lib/db/types";

export function ProductGallery({ product }: { product: Product }) {
  // When Supabase products ship with multiple images, extend this to carry an
  // array. For now we show the main illustration + 3 technical thumbnails.
  const thumbs = [
    product.illustration,
    product.illustration,
    product.illustration,
    product.illustration,
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-start">
      <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-accent-dark">
        <PartImage variant={product.illustration} />
        <div className="absolute left-4 top-4 rounded-sm border border-border bg-background/80 px-2 py-1 text-xs text-muted-strong backdrop-blur">
          {product.partCode || product.slug}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 lg:w-20 lg:grid-cols-1">
        {thumbs.map((variant, i) => (
          <button
            key={i}
            type="button"
            className="aspect-square overflow-hidden rounded-md border border-border bg-accent-dark transition-colors hover:border-primary/60"
            aria-label={`Thumbnail ${i + 1}`}
            tabIndex={-1}
          >
            <PartImage variant={variant} />
          </button>
        ))}
      </div>
    </div>
  );
}
