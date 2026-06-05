"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Save, Search, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInputEU } from "@/components/common/DateInputEU";
import {
  listAllPanelClients,
  type ClientSearchResult,
} from "@/lib/panel/sales/actions";
import { createPreorder, sendPreorderReceipt } from "@/lib/panel/preorders/actions";
import { cn } from "@/lib/utils/cn";

type SupplierOption = { id: string; name: string };

type LineItem = {
  partCode: string;
  description: string;
  quantity: number;
  /** Supplier cost per unit — drives the margin pill. */
  supplierCost: string;
  /** Customer-facing sell price per unit. Empty string until typed. */
  unitPrice: string;
};

const EMPTY_LINE: LineItem = {
  partCode: "",
  description: "",
  quantity: 1,
  supplierCost: "",
  unitPrice: "",
};

// Synthetic placeholder used for panel-created clients without a real email;
// hide it from documents so it never leaks back as the customer's address.
const PLACEHOLDER_EMAIL_RE = /^panel-[a-f0-9-]+@inter-bus\.md$/i;
function realEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return PLACEHOLDER_EMAIL_RE.test(email) ? null : email;
}

export function PreorderForm({
  locale,
  suppliers,
}: {
  locale: string;
  suppliers: SupplierOption[];
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Client picker (existing) vs walk-in (type a name manually). Default to
  // existing — the shop sells to registered clients far more often.
  const [client, setClient] = useState<ClientSearchResult | null>(null);
  const [walkinMode, setWalkinMode] = useState(false);
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinEmail, setWalkinEmail] = useState("");

  // Per-line items (part + qty + cost + price). The shared customer +
  // supplier + ETA + currency + notes live outside this array — server
  // stamps every row with the same preorder_group_id when items.length>1.
  const [lines, setLines] = useState<LineItem[]>([{ ...EMPTY_LINE }]);
  const [supplierId, setSupplierId] = useState<string>("");
  const [currency, setCurrency] = useState<"MDL" | "EUR" | "USD">("MDL");
  const [eta, setEta] = useState<string>("");
  const [notes, setNotes] = useState("");

  function setLine(i: number, patch: Partial<LineItem>) {
    setLines((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    );
  }
  function addLine() {
    setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  }
  function removeLine(i: number) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  const grandTotal = useMemo(
    () =>
      lines.reduce(
        (s, l) => s + (Number(l.unitPrice) || 0) * (Number(l.quantity) || 0),
        0,
      ),
    [lines],
  );

  // Resolve customer-name / phone / email out of either the picked client
  // or the walk-in fields, depending on which mode is active. Form payload
  // shape stays unchanged.
  function resolveCustomer(): {
    name: string;
    phone: string | null;
    email: string | null;
  } | null {
    if (client) {
      const displayName =
        client.account_type === "business"
          ? client.company_name ?? client.full_name ?? client.email ?? "Client"
          : client.full_name ?? client.email ?? "Client";
      return {
        name: displayName,
        phone: client.phone,
        email: realEmail(client.email),
      };
    }
    const name = walkinName.trim();
    if (!name) return null;
    return {
      name,
      phone: walkinPhone.trim() || null,
      email: walkinEmail.trim() || null,
    };
  }

  // After-create panel: when the preorder is registered we DON'T immediately
  // redirect — instead show a small block with two CTAs:
  //   • "Trimite email de înregistrare" → fires sendPreorderReceipt
  //   • "Mergi la listă"                 → navigates to /panel/precomenzi
  // This is the flow the operator asked for: register → optionally email →
  // then leave the form.
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [receiptPending, startReceipt] = useTransition();
  const [receiptSent, setReceiptSent] = useState(false);

  function submit() {
    const customer = resolveCustomer();
    if (!customer) {
      toast.error(t("preorder_form_customer_required"));
      return;
    }
    const cleanLines = lines
      .map((l) => ({
        partCode: l.partCode.trim(),
        description: l.description.trim(),
        quantity: Math.max(0, Math.trunc(Number(l.quantity) || 0)),
        supplierCost: Number(l.supplierCost) || 0,
        unitPrice: Number(l.unitPrice) || 0,
      }))
      .filter((l) => l.description.length > 0);
    if (cleanLines.length === 0) {
      toast.error(t("preorder_form_part_required"));
      return;
    }
    const badQty = cleanLines.find((l) => l.quantity <= 0);
    if (badQty) {
      toast.error(t("preorder_form_qty_required"));
      return;
    }
    const badPrice = cleanLines.find((l) => l.unitPrice <= 0);
    if (badPrice) {
      toast.error(t("preorder_form_price_required"));
      return;
    }
    startTransition(async () => {
      const res = await createPreorder({
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        supplier_id: supplierId || null,
        currency,
        expected_delivery_date: eta || null,
        notes: notes.trim() || null,
        items: cleanLines.map((l) => ({
          part_code: l.partCode || null,
          description: l.description,
          quantity: l.quantity,
          supplier_unit_cost: l.supplierCost,
          unit_price: l.unitPrice,
        })),
      });
      if (res.ok) {
        toast.success(t("preorder_form_created"));
        setCreatedId(res.id);
      } else {
        toast.error(t("accountant_send_error", { reason: res.reason }));
      }
    });
  }

  function sendReceipt() {
    if (!createdId) return;
    startReceipt(async () => {
      const res = await sendPreorderReceipt(createdId);
      if (res.ok) {
        setReceiptSent(true);
        toast.success(t("preorder_receipt_sent"));
      } else {
        toast.error(
          t("preorder_receipt_failed", { reason: res.reason }),
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <CustomerSection
        client={client}
        setClient={(c) => {
          setClient(c);
          if (c) setWalkinMode(false);
        }}
        walkinMode={walkinMode}
        setWalkinMode={(v) => {
          setWalkinMode(v);
          if (v) setClient(null);
        }}
        walkinName={walkinName}
        setWalkinName={setWalkinName}
        walkinPhone={walkinPhone}
        setWalkinPhone={setWalkinPhone}
        walkinEmail={walkinEmail}
        setWalkinEmail={setWalkinEmail}
      />

      <section className="rounded-md border border-border bg-surface p-5">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("preorder_form_section_part")}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLine}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            {t("preorder_form_line_add")}
          </Button>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-2 py-2 w-32">{t("preorder_form_part_code")}</th>
                <th className="px-2 py-2">{t("preorder_form_description")}</th>
                <th className="px-2 py-2 w-16 text-right">{t("preorder_form_quantity")}</th>
                <th className="px-2 py-2 w-28 text-right">{t("preorder_form_supplier_cost")}</th>
                <th className="px-2 py-2 w-28 text-right">{t("preorder_form_unit_price")}</th>
                <th className="px-2 py-2 w-24 text-right">{t("preorder_form_line_total")}</th>
                <th className="px-2 py-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines.map((l, idx) => {
                const qty = Number(l.quantity) || 0;
                const cost = Number(l.supplierCost) || 0;
                const price = Number(l.unitPrice) || 0;
                const margin =
                  cost > 0 && price > 0 ? ((price - cost) / cost) * 100 : null;
                return (
                  <tr key={idx}>
                    <td className="px-2 py-2 align-top">
                      <Input
                        value={l.partCode}
                        onChange={(e) => setLine(idx, { partCode: e.target.value })}
                        className="h-9 font-mono text-xs"
                      />
                    </td>
                    <td className="px-2 py-2 align-top">
                      <Input
                        value={l.description}
                        onChange={(e) => setLine(idx, { description: e.target.value })}
                        placeholder={t("preorder_form_description")}
                        className="h-9 text-xs"
                      />
                    </td>
                    <td className="px-2 py-2 align-top text-right">
                      <Input
                        type="number"
                        min={1}
                        value={l.quantity}
                        onChange={(e) =>
                          setLine(idx, {
                            quantity: Math.max(0, Math.trunc(Number(e.target.value || 0))),
                          })
                        }
                        className="h-9 w-16 text-right"
                      />
                    </td>
                    <td className="px-2 py-2 align-top text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={l.supplierCost}
                        onChange={(e) => setLine(idx, { supplierCost: e.target.value })}
                        placeholder="0.00"
                        className="h-9 w-24 text-right"
                      />
                    </td>
                    <td className="px-2 py-2 align-top text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={l.unitPrice}
                        onChange={(e) => setLine(idx, { unitPrice: e.target.value })}
                        placeholder="0.00"
                        className="h-9 w-24 text-right"
                      />
                      {margin != null ? (
                        <div
                          className={cn(
                            "mt-0.5 text-[10px] font-semibold tabular-nums",
                            margin < 0
                              ? "text-destructive"
                              : margin < 10
                                ? "text-warning"
                                : "text-success",
                          )}
                          title={`Cost: ${cost.toFixed(2)} ${currency}`}
                        >
                          Marja {margin >= 0 ? "+" : ""}
                          {margin.toFixed(0)}%
                        </div>
                      ) : null}
                    </td>
                    <td className="px-2 py-2 align-top text-right tabular-nums text-xs">
                      {(qty * price).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 align-top text-right">
                      {lines.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-muted transition-colors hover:text-destructive"
                          aria-label={t("preorder_form_line_remove")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("preorder_form_section_supplier")}
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label={t("preorder_form_supplier")}>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">{t("preorder_form_supplier_placeholder")}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("preorder_form_currency_label")}>
            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as "MDL" | "EUR" | "USD")
              }
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="MDL">MDL</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </Field>
          <Field label={t("preorder_form_eta")}>
            <DateInputEU value={eta} onChange={(iso) => setEta(iso)} />
          </Field>
        </div>
        <div className="mt-3 rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
          {t("preorder_form_total_preview", {
            total: grandTotal.toFixed(2),
            currency,
          })}
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <Field label={t("preorder_form_notes")}>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            placeholder={t("preorder_form_notes_placeholder")}
          />
        </Field>
      </section>

      {createdId ? (
        <section className="rounded-md border border-success/40 bg-success/5 p-5">
          <h3 className="text-sm font-semibold text-success">
            {t("preorder_form_created")}
          </h3>
          <p className="mt-1 text-xs text-muted-strong">
            {t("preorder_form_after_create_hint")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={sendReceipt}
              disabled={receiptPending || receiptSent}
              className="gap-1.5"
            >
              {receiptSent
                ? t("preorder_receipt_sent")
                : receiptPending
                  ? t("preorder_receipt_sending")
                  : t("preorder_receipt_send")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/${locale}/panel/precomenzi`)}
            >
              {t("preorder_form_go_to_list")}
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex justify-end">
          <Button type="button" onClick={submit} disabled={pending} className="gap-1.5">
            <Save className="size-4" />
            {pending ? t("preorder_form_saving") : t("preorder_form_submit")}
          </Button>
        </div>
      )}
    </div>
  );
}

function CustomerSection({
  client,
  setClient,
  walkinMode,
  setWalkinMode,
  walkinName,
  setWalkinName,
  walkinPhone,
  setWalkinPhone,
  walkinEmail,
  setWalkinEmail,
}: {
  client: ClientSearchResult | null;
  setClient: (c: ClientSearchResult | null) => void;
  walkinMode: boolean;
  setWalkinMode: (v: boolean) => void;
  walkinName: string;
  setWalkinName: (v: string) => void;
  walkinPhone: string;
  setWalkinPhone: (v: string) => void;
  walkinEmail: string;
  setWalkinEmail: (v: string) => void;
}) {
  const t = useTranslations("panel");
  const [allClients, setAllClients] = useState<ClientSearchResult[]>([]);
  const [filter, setFilter] = useState("");
  const [loadingList, startLoad] = useTransition();

  useEffect(() => {
    if (client || walkinMode || allClients.length > 0) return;
    startLoad(async () => {
      const r = await listAllPanelClients();
      setAllClients(r);
    });
  }, [client, walkinMode, allClients.length]);

  const visibleClients = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return allClients;
    return allClients.filter((c) => {
      const fields = [c.company_name, c.full_name, c.email, c.phone, c.idno];
      return fields.some((f) => f?.toLowerCase().includes(term));
    });
  }, [allClients, filter]);

  if (client) {
    return (
      <section className="rounded-md border border-primary/30 bg-primary/5 p-5">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("sale_client_selected")}
          </h3>
          <button
            type="button"
            onClick={() => setClient(null)}
            className="text-xs text-primary hover:underline"
          >
            {t("sale_client_change")}
          </button>
        </header>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
            {client.account_type === "business" ? (
              <Building2 className="size-5" />
            ) : (
              <User className="size-5" />
            )}
          </span>
          <div>
            <div className="font-semibold">
              {client.account_type === "business"
                ? client.company_name ?? client.full_name ?? client.email
                : client.full_name ?? client.email}
            </div>
            <div className="text-xs text-muted-strong">
              {client.email} {client.phone ? `· ${client.phone}` : ""}
              {client.idno ? ` · IDNO ${client.idno}` : ""}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <header className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setWalkinMode(false)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium",
            !walkinMode
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-strong hover:text-foreground",
          )}
        >
          {t("sale_client_search_existing")}
        </button>
        <button
          type="button"
          onClick={() => setWalkinMode(true)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium",
            walkinMode
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-strong hover:text-foreground",
          )}
        >
          {t("sale_client_walkin_new")}
        </button>
      </header>

      {walkinMode ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={t("preorder_form_customer_name")} required>
            <Input value={walkinName} onChange={(e) => setWalkinName(e.target.value)} />
          </Field>
          <Field label={t("preorder_form_customer_phone")}>
            <Input
              type="tel"
              value={walkinPhone}
              onChange={(e) => setWalkinPhone(e.target.value)}
            />
          </Field>
          <Field
            label={t("preorder_form_customer_email")}
            hint={t("preorder_form_customer_email_hint")}
          >
            <Input
              type="email"
              value={walkinEmail}
              onChange={(e) => setWalkinEmail(e.target.value)}
            />
          </Field>
        </div>
      ) : (
        <div>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t("sale_client_search_placeholder")}
              className="pl-8"
            />
          </div>
          <div className="max-h-64 overflow-y-auto rounded-md border border-border">
            {loadingList && allClients.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted">…</div>
            ) : visibleClients.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted">
                {t("sale_client_no_results")}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {visibleClients.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setClient(c)}
                      className="flex w-full items-start gap-3 px-3 py-2 text-left text-xs hover:bg-surface-elevated"
                    >
                      <span className="mt-0.5 grid size-6 place-items-center rounded-full bg-primary/10 text-primary">
                        {c.account_type === "business" ? (
                          <Building2 className="size-3" />
                        ) : (
                          <User className="size-3" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">
                          {c.account_type === "business"
                            ? c.company_name ?? c.full_name ?? c.email
                            : c.full_name ?? c.email}
                        </div>
                        <div className="truncate text-[10px] text-muted">
                          {c.email} {c.phone ? `· ${c.phone}` : ""}
                          {c.idno ? ` · IDNO ${c.idno}` : ""}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}
