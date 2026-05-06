"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  Download,
  Image as ImageIcon,
  Loader2,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  importProductFromTecdoc,
  lookupTecdocByPartCode,
} from "@/lib/admin/tecdoc/actions";
import type { TecdocPart } from "@/lib/apify/tecdoc";
import { cn } from "@/lib/utils/cn";

type Labels = {
  open: string;
  title: string;
  subtitle: string;
  search_placeholder: string;
  search: string;
  refresh: string;
  source_apify: string;
  source_cache: string;
  no_results: string;
  not_configured: string;
  err_generic: string;
  field_price: string;
  field_stock: string;
  field_category: string;
  field_category_none: string;
  vehicle_compat: string;
  oem_codes: string;
  specs: string;
  images: string;
  import: string;
  importing: string;
  imported: string;
  edit_after: string;
  close: string;
};

export function TecdocImportModal({
  isAvailable,
  categories,
  locale,
  labels,
}: {
  isAvailable: boolean;
  categories: { id: string; name: string }[];
  locale: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [results, setResults] = useState<TecdocPart[]>([]);
  const [source, setSource] = useState<"apify" | "cache" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [importPending, startImportTransition] = useTransition();
  const [importedKeys, setImportedKeys] = useState<Set<string>>(new Set());

  const onSearch = (e: FormEvent<HTMLFormElement>, fresh = false) => {
    e?.preventDefault?.();
    const q = code.trim();
    if (!q) return;
    setError(null);
    startTransition(async () => {
      const res = await lookupTecdocByPartCode(q, { fresh });
      if (!res.ok) {
        setResults([]);
        setSource(null);
        setError(
          res.code === "not_configured"
            ? labels.not_configured
            : res.code === "no_results"
              ? labels.no_results
              : (res.message ?? labels.err_generic),
        );
        return;
      }
      setResults(res.parts);
      setSource(res.source);
      setError(null);
    });
  };

  const onImport = (
    part: TecdocPart,
    extra: { price: number; stockQuantity: number; categoryId: string | null },
  ) => {
    startImportTransition(async () => {
      const res = await importProductFromTecdoc({
        partCode: part.partCode,
        brand: part.brand,
        nameRo: part.name,
        nameEn: part.name,
        nameRu: part.name,
        descriptionRo: part.description,
        descriptionEn: part.description,
        descriptionRu: part.description,
        images: part.images,
        imageUrl: part.images[0] ?? null,
        oemCodes: part.oemCodes,
        vehicles: part.vehicles,
        tecdocId: part.tecdocId,
        weightKg: part.weightKg,
        widthMm: part.widthMm,
        heightMm: part.heightMm,
        price: extra.price,
        stockQuantity: extra.stockQuantity,
        categoryId: extra.categoryId,
        isActive: false, // imported products start as draft
      });
      if (!res.ok) {
        toast.error(res.message ?? labels.err_generic);
        return;
      }
      toast.success(labels.imported);
      const key = `${part.brand ?? ""}-${part.partCode}`;
      setImportedKeys((s) => new Set([...s, key]));
      router.refresh();
    });
  };

  return (
    <>
      <Button
        type="button"
        size="md"
        variant="secondary"
        className="uppercase tracking-wider"
        onClick={() => setOpen(true)}
        disabled={!isAvailable}
        title={isAvailable ? undefined : labels.not_configured}
      >
        <Database className="size-4" />
        {labels.open}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/85 p-4 backdrop-blur md:p-8">
          <div className="w-full max-w-4xl rounded-md border border-border bg-surface shadow-xl">
            {/* Header */}
            <header className="flex items-start justify-between gap-3 border-b border-border p-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                  TECDOC · APIFY
                </div>
                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  {labels.title}
                </h2>
                <p className="mt-1 text-sm text-muted-strong">{labels.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-md border border-border bg-background text-muted-strong transition-colors hover:border-border-strong hover:text-foreground"
                aria-label={labels.close}
              >
                <X className="size-4" />
              </button>
            </header>

            {/* Search */}
            <div className="border-b border-border p-5">
              <form
                onSubmit={(e) => onSearch(e, false)}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
                    <Search className="size-4" />
                  </span>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={labels.search_placeholder}
                    className="pl-9 font-mono uppercase tracking-wider"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  size="md"
                  className="uppercase tracking-wider"
                  disabled={pending || !code.trim()}
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  {labels.search}
                </Button>
                <Button
                  type="button"
                  size="md"
                  variant="ghost"
                  className="uppercase tracking-wider"
                  onClick={() => onSearch(undefined as never, true)}
                  disabled={pending || !code.trim()}
                  title="Bypass cache"
                >
                  <RefreshCcw className="size-4" />
                  {labels.refresh}
                </Button>
              </form>

              {source ? (
                <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {source === "apify" ? (
                    <>
                      <span className="size-2 rounded-full bg-primary" />
                      {labels.source_apify}
                    </>
                  ) : (
                    <>
                      <span className="size-2 rounded-full bg-success" />
                      {labels.source_cache}
                    </>
                  )}
                  · {results.length} results
                </div>
              ) : null}

              {error ? (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {results.length === 0 && !pending && !error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted">
                  <Database className="size-8 text-muted/40" />
                  <p className="mt-2">
                    {isAvailable ? labels.subtitle : labels.not_configured}
                  </p>
                </div>
              ) : null}

              <ul className="flex flex-col gap-3">
                {results.map((part, idx) => (
                  <ResultCard
                    key={`${part.brand}-${part.partCode}-${idx}`}
                    part={part}
                    categories={categories}
                    imported={importedKeys.has(`${part.brand ?? ""}-${part.partCode}`)}
                    importPending={importPending}
                    onImport={(extra) => onImport(part, extra)}
                    locale={locale}
                    labels={{
                      field_price: labels.field_price,
                      field_stock: labels.field_stock,
                      field_category: labels.field_category,
                      field_category_none: labels.field_category_none,
                      vehicle_compat: labels.vehicle_compat,
                      oem_codes: labels.oem_codes,
                      specs: labels.specs,
                      images: labels.images,
                      import: labels.import,
                      importing: labels.importing,
                      imported: labels.imported,
                      edit_after: labels.edit_after,
                    }}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ResultCard({
  part,
  categories,
  imported,
  importPending,
  onImport,
  labels,
}: {
  part: TecdocPart;
  categories: { id: string; name: string }[];
  imported: boolean;
  importPending: boolean;
  onImport: (extra: {
    price: number;
    stockQuantity: number;
    categoryId: string | null;
  }) => void;
  locale: string;
  labels: {
    field_price: string;
    field_stock: string;
    field_category: string;
    field_category_none: string;
    vehicle_compat: string;
    oem_codes: string;
    specs: string;
    images: string;
    import: string;
    importing: string;
    imported: string;
    edit_after: string;
  };
}) {
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>("");

  return (
    <li className="rounded-md border border-border bg-background/30 p-4">
      <div className="flex items-start gap-4">
        <div className="size-16 shrink-0 overflow-hidden rounded-sm border border-border bg-accent-dark">
          {part.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={part.images[0]}
              alt={part.name ?? part.partCode}
              className="size-full object-contain"
            />
          ) : (
            <div className="grid size-full place-items-center text-muted">
              <ImageIcon className="size-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              {part.brand ?? "—"}
            </span>
            <span className="rounded-sm border border-border bg-accent-dark px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-muted-strong">
              {part.partCode}
            </span>
            {part.tecdocId ? (
              <span className="font-mono text-[9px] text-muted">
                tecdoc · {part.tecdocId}
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{part.name ?? "—"}</h3>
          {part.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted-strong">
              {part.description}
            </p>
          ) : null}

          <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-3">
            <Stat
              label={labels.images}
              value={part.images.length.toString()}
            />
            <Stat
              label={labels.oem_codes}
              value={part.oemCodes.length.toString()}
            />
            <Stat
              label={labels.vehicle_compat}
              value={part.vehicles.length.toString()}
            />
          </div>

          {part.specs.length > 0 ? (
            <details className="mt-3 rounded-sm border border-border bg-surface px-3 py-2 text-xs">
              <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted">
                {labels.specs} ({part.specs.length})
              </summary>
              <dl className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                {part.specs.slice(0, 12).map((s, i) => (
                  <div key={`${s.key}-${i}`} className="flex items-baseline gap-2">
                    <dt className="text-muted">{s.key}:</dt>
                    <dd className="font-mono text-muted-strong">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ) : null}
        </div>
      </div>

      {/* Import controls */}
      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <Field label={labels.field_price}>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            placeholder="0.00"
          />
        </Field>
        <Field label={labels.field_stock}>
          <Input
            type="number"
            min={0}
            step={1}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label={labels.field_category}>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary"
          >
            <option value="">{labels.field_category_none}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <Button
            type="button"
            size="md"
            className={cn(
              "w-full uppercase tracking-wider sm:w-auto",
              imported && "pointer-events-none opacity-60",
            )}
            onClick={() =>
              onImport({
                price,
                stockQuantity: stock,
                categoryId: categoryId || null,
              })
            }
            disabled={importPending || imported}
          >
            {imported ? (
              <>
                <CheckCircle2 className="size-4" />
                {labels.imported}
              </>
            ) : importPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {labels.importing}
              </>
            ) : (
              <>
                <Download className="size-4" />
                {labels.import}
                <ArrowRight className="size-3" />
              </>
            )}
          </Button>
        </div>
      </div>
      {imported ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted">
          {labels.edit_after}
        </p>
      ) : null}
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface px-2 py-1.5 font-mono">
      <div className="text-[9px] uppercase tracking-wider text-muted">{label}</div>
      <div className="text-xs font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
