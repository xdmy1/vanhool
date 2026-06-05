"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Save, Search, User } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInputEU } from "@/components/common/DateInputEU";
import {
  listAllPanelClients,
  type ClientSearchResult,
} from "@/lib/panel/sales/actions";
import { createPreorder } from "@/lib/panel/preorders/actions";
import { cn } from "@/lib/utils/cn";

type SupplierOption = { id: string; name: string };

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

  const [partCode, setPartCode] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [supplierId, setSupplierId] = useState<string>("");
  const [supplierCost, setSupplierCost] = useState<string>("");
  // Operator types the SELLING price. Margin is computed from that and shown
  // back as a read-only indicator — no more silent "default 25%" markup.
  const [unitPriceManual, setUnitPriceManual] = useState<string>("");
  const [currency, setCurrency] = useState<"MDL" | "EUR" | "USD">("MDL");
  const [eta, setEta] = useState<string>("");
  const [notes, setNotes] = useState("");

  const unitPrice = Number(unitPriceManual) || 0;
  const cost = Number(supplierCost) || 0;
  const marginPct = useMemo(() => {
    if (cost <= 0 || unitPrice <= 0) return null;
    return ((unitPrice - cost) / cost) * 100;
  }, [cost, unitPrice]);

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

  function submit() {
    const customer = resolveCustomer();
    if (!customer) {
      toast.error(t("preorder_form_customer_required"));
      return;
    }
    if (!description.trim()) {
      toast.error(t("preorder_form_part_required"));
      return;
    }
    if (quantity <= 0) {
      toast.error(t("preorder_form_qty_required"));
      return;
    }
    if (unitPrice <= 0) {
      toast.error(t("preorder_form_price_required"));
      return;
    }
    startTransition(async () => {
      const res = await createPreorder({
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        part_code: partCode.trim() || null,
        description: description.trim(),
        quantity,
        supplier_id: supplierId || null,
        supplier_unit_cost: cost,
        unit_price: unitPrice,
        currency,
        expected_delivery_date: eta || null,
        notes: notes.trim() || null,
      });
      if (res.ok) {
        toast.success(t("preorder_form_created"));
        router.push(`/${locale}/panel/precomenzi`);
      } else {
        toast.error(t("accountant_send_error", { reason: res.reason }));
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
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("preorder_form_section_part")}
        </h3>
        <div className="grid gap-3 md:grid-cols-[160px_1fr_140px]">
          <Field label={t("preorder_form_part_code")}>
            <Input
              value={partCode}
              onChange={(e) => setPartCode(e.target.value)}
              className="font-mono"
            />
          </Field>
          <Field label={t("preorder_form_description")} required>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field label={t("preorder_form_quantity")} required>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.trunc(Number(e.target.value || 1))))
              }
            />
          </Field>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("preorder_form_section_supplier")}
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
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
          <Field label={t("preorder_form_supplier_cost")}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={supplierCost}
                onChange={(e) => setSupplierCost(e.target.value)}
                placeholder="0.00"
              />
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as "MDL" | "EUR" | "USD")
                }
                className="h-10 rounded-md border border-border bg-surface px-2 text-sm"
              >
                <option value="MDL">MDL</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </Field>
          <Field label={t("preorder_form_unit_price")} required>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={unitPriceManual}
              onChange={(e) => setUnitPriceManual(e.target.value)}
              placeholder="0.00"
            />
            {marginPct != null ? (
              <div
                className={cn(
                  "mt-1 text-[11px] font-semibold tabular-nums",
                  marginPct < 0
                    ? "text-destructive"
                    : marginPct < 10
                      ? "text-warning"
                      : "text-success",
                )}
                title={`Cost: ${cost.toFixed(2)} ${currency}`}
              >
                Marja {marginPct >= 0 ? "+" : ""}
                {marginPct.toFixed(1)}%
              </div>
            ) : (
              <p className="mt-1 text-[11px] text-muted">
                {t("preorder_form_unit_price_no_cost")}
              </p>
            )}
          </Field>
          <Field label={t("preorder_form_eta")}>
            <DateInputEU value={eta} onChange={(iso) => setEta(iso)} />
          </Field>
        </div>
        <div className="mt-3 rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
          {t("preorder_form_total_preview", {
            total: (quantity * unitPrice).toFixed(2),
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

      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={pending} className="gap-1.5">
          <Save className="size-4" />
          {pending ? t("preorder_form_saving") : t("preorder_form_submit")}
        </Button>
      </div>
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
