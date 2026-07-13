import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  NewProformaForm,
  type ProformaInitial,
} from "@/components/panel/proforma/NewProformaForm";
import { getInvoice } from "@/lib/panel/invoices/queries";
import { createClient } from "@/lib/supabase/server";

const MS_PER_DAY = 86_400_000;

/**
 * Recover a per-line cost the snapshot doesn't carry, so the margin buttons
 * ("+30%", "-15%") can reprice on edit. Older proformas — and any line typed
 * before its part was catalogued — froze no cost_price; without one, applying
 * a margin silently did nothing. Look the part up in the catalog by code and
 * fill its GROSS MDL cost. Parts still not in the catalog stay uncosted (the
 * form then warns instead of failing silently).
 */
async function backfillLineCosts(
  lines: ProformaInitial["lines"],
): Promise<ProformaInitial["lines"]> {
  const need = lines
    .filter((l) => !(l.cost_price > 0) && l.part_code.trim())
    .map((l) => l.part_code.trim());
  if (need.length === 0) return lines;

  const supabase = await createClient();
  const costByCode = new Map<string, number>();
  for (const code of Array.from(new Set(need))) {
    const escaped = code.replace(/[\\%_]/g, "\\$&");
    const { data } = await supabase
      .from("products")
      .select("part_code, supplier_code, cost_price")
      .or(`part_code.ilike.${escaped},supplier_code.ilike.${escaped}`)
      .limit(2);
    // Only trust an unambiguous single match — never guess which product.
    if (data && data.length === 1 && Number(data[0].cost_price) > 0) {
      costByCode.set(code.toLowerCase(), Number(data[0].cost_price));
    }
  }
  if (costByCode.size === 0) return lines;
  return lines.map((l) =>
    !(l.cost_price > 0) && l.part_code.trim()
      ? { ...l, cost_price: costByCode.get(l.part_code.trim().toLowerCase()) ?? 0 }
      : l,
  );
}

function diffDays(issued: string, due: string | null): number {
  if (!due) return 7;
  const a = new Date(issued).getTime();
  const b = new Date(due).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 7;
  return Math.max(0, Math.round((b - a) / MS_PER_DAY));
}

export default async function EditProformaPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const [{ locale, id }, t] = await Promise.all([
    params,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const proforma = await getInvoice(id);
  if (!proforma || proforma.type !== "proforma") notFound();
  // Lock once the document is no longer mutable.
  if (proforma.converted_to_invoice_id || proforma.status === "void") {
    redirect(`/${locale}/panel/proforme/${id}`);
  }

  const cs = proforma.customer_snapshot;
  const initial: ProformaInitial = {
    id: proforma.id,
    walkin: {
      name: cs.name ?? "",
      company_name: "",
      email: cs.email ?? "",
      phone: cs.phone ?? "",
      idno: cs.idno ?? "",
      vat_number: cs.vat_number ?? "",
      address: cs.address ?? "",
    },
    lines:
      proforma.items_snapshot.length > 0
        ? proforma.items_snapshot.map((it) => ({
            part_code: it.partCode ?? "",
            name: it.name ?? "",
            description: it.description ?? "",
            quantity: Number(it.quantity ?? 1),
            unit: ((it as { unit?: "buc" | "l" | "m" }).unit ?? "buc") as
              | "buc"
              | "l"
              | "m",
            unit_price: Number(it.unit_price ?? 0),
            discounted_unit_price:
              it.discounted_unit_price != null
                ? Number(it.discounted_unit_price)
                : null,
            vat_rate: Number(it.vat_rate ?? 20),
            // Carry the captured cost forward on edit so the digital
            // detail keeps showing margin after a small tweak.
            // Falls back to 0 for legacy snapshots that pre-date the
            // cost_price field.
            cost_price: Number(it.cost_price ?? 0),
            // Catalog price isn't snapshotted on the doc, so no yellow
            // reference for already-saved lines (only fresh picks show it).
            catalog_price: 0,
            // Restore the +30/-15 margin status so the buttons reprice from
            // the base, not from the shown (already-marked-up) price.
            markup_percent: Number(
              (it as { markup_percent?: number | null }).markup_percent ?? 0,
            ),
          }))
        : [
            {
              part_code: "",
              name: "",
              description: "",
              quantity: 1,
              unit: "buc" as const,
              unit_price: 0,
              discounted_unit_price: null,
              vat_rate: 20,
              cost_price: 0,
              catalog_price: 0,
              markup_percent: 0,
            },
          ],
    scope: proforma.account_scope,
    currency: (proforma.currency as "MDL" | "EUR" | "USD") ?? "MDL",
    outputLocale: proforma.output_locale,
    dueDays: diffDays(proforma.issued_date, proforma.due_date),
    notes: proforma.notes ?? "",
  };
  initial.lines = await backfillLineCosts(initial.lines);

  const number = `${proforma.series ?? ""}${proforma.number ?? ""}`;
  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: `/panel/proforme/${id}`, label: t("clienti_detail_back"), locale }}
        title={`${t("proforma_edit_title")} ${number}`}
        subtitle={t("proforma_edit_subtitle")}
      />
      <div className="mt-8">
        <NewProformaForm locale={locale} initial={initial} />
      </div>
    </div>
  );
}
