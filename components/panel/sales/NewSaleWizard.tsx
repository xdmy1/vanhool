"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceWithVatHelper } from "@/components/common/PriceWithVatHelper";
import { Price } from "@/components/common/Price";
import { cn } from "@/lib/utils/cn";
import {
  type ClientSearchResult,
  type ProductSearchResult,
  createManualSale,
  listAllPanelClients,
  searchProducts,
} from "@/lib/panel/sales/actions";

type Scope = "conta1" | "conta2";

type WalkIn = {
  name: string;
  phone: string;
  email: string;
  idno: string;
  company_name: string;
};

type Line = {
  product: ProductSearchResult;
  qty: number;
  /** Normal price per unit — what the line "would have cost" at full price. */
  unit_price: number;
  /**
   * Operator-typed discounted price per unit. null / equal-or-higher than
   * `unit_price` → no discount applied on this line.
   */
  discounted_unit_price: number | null;
};

export function NewSaleWizard({ locale }: { locale: string }) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [scope, setScope] = useState<Scope | null>(null);

  const [client, setClient] = useState<ClientSearchResult | null>(null);
  const [walkin, setWalkin] = useState<WalkIn>({
    name: "",
    phone: "",
    email: "",
    idno: "",
    company_name: "",
  });
  const [walkinMode, setWalkinMode] = useState(false);

  const [lines, setLines] = useState<Line[]>([]);
  // Per-sale markup % applied on top of cost_price. Empty = no auto-pricing,
  // each line keeps its own unit_price (catalog price, possibly manually edited).
  const [saleMarkupPercent, setSaleMarkupPercent] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "already_paid">("cash");
  // Default to whatever currency the operator used on their last sale, so we
  // stop silently saving MDL when they meant EUR. The current shop pattern
  // is several EUR sales in a row — forcing the picker back to MDL between
  // them is exactly how IB-00015 + the two 12:44/12:45 sales ended up
  // mislabelled.
  const [currency, setCurrency] = useState<"MDL" | "EUR" | "USD">(() => {
    if (typeof window === "undefined") return "MDL";
    const saved = window.localStorage.getItem("panel.sale.lastCurrency");
    if (saved === "EUR" || saved === "USD" || saved === "MDL") return saved;
    return "MDL";
  });
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [driverName, setDriverName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [notes, setNotes] = useState("");
  // Optional VAT typed in manually by the owner. Empty = no VAT applied.
  const [vatAmount, setVatAmount] = useState<string>("");

  const [submitting, startSubmit] = useTransition();

  // Subtotal numbers are derived from per-line discounts (the operator types
  // a lower unit price on individual lines, never a global percent). Lines
  // without a discounted_unit_price contribute at the full unit_price.
  const effectiveOf = (l: Line): number =>
    l.discounted_unit_price != null && l.discounted_unit_price < l.unit_price
      ? l.discounted_unit_price
      : l.unit_price;
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.qty * effectiveOf(l), 0),
    [lines],
  );
  const subtotalBeforeDiscount = useMemo(
    () => lines.reduce((s, l) => s + l.qty * l.unit_price, 0),
    [lines],
  );
  const lineDiscountAmount = Number(
    (subtotalBeforeDiscount - subtotal).toFixed(2),
  );
  const lineDiscountPct =
    subtotalBeforeDiscount > 0
      ? Math.min(
          100,
          Number(((lineDiscountAmount / subtotalBeforeDiscount) * 100).toFixed(2)),
        )
      : 0;
  const vatNum =
    scope === "conta2" || vatAmount.trim() === "" ? 0 : Math.max(0, Number(vatAmount) || 0);
  const grandTotal = Number((subtotal + vatNum).toFixed(2));

  const customerSet = client !== null || (walkinMode && walkin.name.trim().length > 0);
  const STEPS = [
    { id: 1, label: t("sale_step_conta") },
    { id: 2, label: t("sale_step_client") },
    { id: 3, label: t("sale_step_products") },
    { id: 4, label: t("sale_step_payment") },
    { id: 5, label: t("sale_step_review") },
  ];

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return scope !== null;
      case 2:
        return customerSet;
      case 3:
        return lines.length > 0;
      case 4:
        return deliveryAddress.trim().length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  }

  function next() {
    if (canAdvance()) setStep((s) => Math.min(5, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  // Whenever the step changes, snap the wizard back to the top of the
  // viewport so a long previous step (e.g. a packed products list on step 3)
  // doesn't leave the operator scrolled past the new step's header.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function submit() {
    if (!scope || lines.length === 0 || !deliveryAddress.trim()) return;
    startSubmit(async () => {
      const payload = {
        account_scope: scope,
        client_id: client?.id ?? null,
        walkin: client
          ? null
          : {
              name: walkin.name.trim(),
              phone: walkin.phone || null,
              email: walkin.email || null,
              idno: walkin.idno || null,
              company_name: walkin.company_name || null,
            },
        items: lines.map((l) => ({
          product_id: l.product.id,
          qty: l.qty,
          unit_price: l.unit_price,
          discounted_unit_price:
            l.discounted_unit_price != null && l.discounted_unit_price < l.unit_price
              ? l.discounted_unit_price
              : null,
        })),
        payment_method: paymentMethod,
        currency,
        delivery_address: deliveryAddress.trim(),
        driver_name: driverName || null,
        vehicle_plate: vehiclePlate || null,
        notes: notes || null,
        vat_amount: vatNum,
        // Document-level discount_percent is derived from the line reductions
        // (single source of truth = per-line). Keep it so historical reporting
        // continues to work.
        discount_percent: lineDiscountPct,
      };
      const res = await createManualSale(payload);
      if (res.ok) {
        const suffix = res.invoiceId ? t("sale_success_invoice") : "";
        toast.success(t("sale_success", { total: res.total.toFixed(2) }) + suffix);
        if (res.deliveryNoteId) {
          // Open the print sheet in a new tab so the operator can keep
          // navigating in the panel — landing them on the delivery note
          // detail page where they can re-print, view status, etc.
          window.open(
            `/${locale}/panel/fisa-de-livrare/${res.deliveryNoteId}/print?auto=1`,
            "_blank",
            "noopener",
          );
          router.push(
            `/${locale}/panel/fisa-de-livrare/${res.deliveryNoteId}` as "/panel",
          );
        } else {
          router.push(`/${locale}/panel`);
        }
      } else {
        toast.error(t("sale_error", { reason: res.reason }));
      }
    });
  }

  return (
    <div ref={wrapRef} className="space-y-6 scroll-mt-20">
      <Stepper current={step} steps={STEPS} />

      {step === 1 ? <StepScope scope={scope} onPick={setScope} /> : null}

      {step === 2 ? (
        <StepClient
          client={client}
          setClient={setClient}
          walkinMode={walkinMode}
          setWalkinMode={setWalkinMode}
          walkin={walkin}
          setWalkin={setWalkin}
        />
      ) : null}

      {step === 3 ? (
        <StepProducts
          lines={lines}
          setLines={setLines}
          clientDiscount={client?.discount_percent ?? null}
          saleMarkupPercent={saleMarkupPercent}
          setSaleMarkupPercent={setSaleMarkupPercent}
          currency={currency}
          setCurrency={setCurrency}
        />
      ) : null}

      {step === 4 ? (
        <StepPayment
          scope={scope!}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          currency={currency}
          deliveryAddress={deliveryAddress}
          setDeliveryAddress={setDeliveryAddress}
          driverName={driverName}
          setDriverName={setDriverName}
          vehiclePlate={vehiclePlate}
          setVehiclePlate={setVehiclePlate}
          notes={notes}
          setNotes={setNotes}
          vatAmount={vatAmount}
          setVatAmount={setVatAmount}
          subtotal={subtotal}
          subtotalBeforeDiscount={subtotalBeforeDiscount}
          lineDiscountAmount={lineDiscountAmount}
          lineDiscountPct={lineDiscountPct}
          fallbackAddress={client?.billing_address ?? ""}
        />
      ) : null}

      {step === 5 ? (
        <StepReview
          scope={scope!}
          client={client}
          walkin={walkinMode ? walkin : null}
          lines={lines}
          paymentMethod={paymentMethod}
          deliveryAddress={deliveryAddress}
          driverName={driverName}
          vehiclePlate={vehiclePlate}
          notes={notes}
          subtotal={subtotal}
          subtotalBeforeDiscount={subtotalBeforeDiscount}
          lineDiscountAmount={lineDiscountAmount}
          lineDiscountPct={lineDiscountPct}
          vatAmount={vatNum}
          grandTotal={grandTotal}
          currency={currency}
        />
      ) : null}

      <footer className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={back} disabled={step === 1}>
          <ChevronLeft className="size-4" />
          {t("action_back")}
        </Button>
        <div className="text-right text-sm text-muted-strong tabular-nums">
          {lineDiscountPct > 0 ? (
            <div className="text-xs text-success">
              {t("sale_discount_footer", { percent: Math.round(lineDiscountPct) })}
            </div>
          ) : null}
          {t("sale_subtotal_label")}{" "}
          <span className="font-semibold text-foreground">
            <Price value={grandTotal} currency={currency} size="md" accent={false} />
          </span>
        </div>
        {step < 5 ? (
          <Button type="button" onClick={next} disabled={!canAdvance()} className="gap-1.5">
            {t("action_continue")}
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={submit}
            disabled={submitting || lines.length === 0}
            className="gap-1.5"
          >
            <Check className="size-4" />
            {submitting ? t("sale_processing") : t("sale_confirm_button")}
          </Button>
        )}
      </footer>
    </div>
  );
}

// =====================================================================
// Step 1: scope

function StepScope({
  scope,
  onPick,
}: {
  scope: Scope | null;
  onPick: (s: Scope) => void;
}) {
  const t = useTranslations("panel");
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <ScopeCard
        active={scope === "conta1"}
        onClick={() => onPick("conta1")}
        title={t("sale_scope_conta1_title")}
        subtitle={t("sale_scope_conta1_subtitle")}
        body={t("sale_scope_conta1_body")}
        accent="primary"
      />
      <ScopeCard
        active={scope === "conta2"}
        onClick={() => onPick("conta2")}
        title={t("sale_scope_conta2_title")}
        subtitle={t("sale_scope_conta2_subtitle")}
        body={t("sale_scope_conta2_body")}
        accent="warning"
      />
    </section>
  );
}

function ScopeCard({
  active,
  onClick,
  title,
  subtitle,
  body,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  body: string;
  accent: "primary" | "warning";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border-2 bg-surface p-6 text-left transition-all",
        active
          ? accent === "primary"
            ? "border-primary bg-primary/5 shadow-md"
            : "border-warning bg-warning/5 shadow-md"
          : "border-border hover:border-primary/40",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        {active ? <Check className="size-5 text-primary" /> : null}
      </div>
      <p className="mb-3 text-sm font-medium text-muted-strong">{subtitle}</p>
      <p className="text-sm text-muted">{body}</p>
    </button>
  );
}

// =====================================================================
// Step 2: client picker

function StepClient({
  client,
  setClient,
  walkinMode,
  setWalkinMode,
  walkin,
  setWalkin,
}: {
  client: ClientSearchResult | null;
  setClient: (c: ClientSearchResult | null) => void;
  walkinMode: boolean;
  setWalkinMode: (b: boolean) => void;
  walkin: WalkIn;
  setWalkin: (w: WalkIn) => void;
}) {
  const t = useTranslations("panel");
  const [allClients, setAllClients] = useState<ClientSearchResult[]>([]);
  const [filter, setFilter] = useState("");
  const [loadingList, startLoad] = useTransition();

  // Pickable list, not autocomplete — load every client on mount and let the
  // operator filter in-page. Total count is small by design.
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
      const fields = [
        c.company_name,
        c.full_name,
        c.email,
        c.phone,
        c.idno,
      ];
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
            className="text-xs text-primary underline-offset-2 hover:underline"
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
            {client.discount_percent ? (
              <div className="mt-1 text-xs text-primary">
                {t("sale_client_discount_applied", { percent: client.discount_percent })}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  if (walkinMode) {
    return (
      <section className="rounded-md border border-border bg-surface p-5">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("sale_client_walkin_title")}
          </h3>
          <button
            type="button"
            onClick={() => setWalkinMode(false)}
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            {t("sale_client_walkin_search_back")}
          </button>
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={t("sale_client_walkin_name")} required>
            <Input
              value={walkin.name}
              onChange={(e) => setWalkin({ ...walkin, name: e.target.value })}
            />
          </Field>
          <Field label={t("sale_client_walkin_company")}>
            <Input
              value={walkin.company_name}
              onChange={(e) =>
                setWalkin({ ...walkin, company_name: e.target.value })
              }
            />
          </Field>
          <Field label={t("sale_client_walkin_phone")}>
            <Input
              value={walkin.phone}
              onChange={(e) => setWalkin({ ...walkin, phone: e.target.value })}
            />
          </Field>
          <Field label={t("sale_client_walkin_email")}>
            <Input
              type="email"
              value={walkin.email}
              onChange={(e) => setWalkin({ ...walkin, email: e.target.value })}
              placeholder={t("sale_client_walkin_email_hint")}
            />
          </Field>
          <Field label={t("sale_client_walkin_idno")}>
            <Input
              value={walkin.idno}
              onChange={(e) => setWalkin({ ...walkin, idno: e.target.value })}
            />
          </Field>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {t("sale_client_search_existing")}
        </h3>
        <button
          type="button"
          onClick={() => setWalkinMode(true)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="size-3.5" />
          {t("sale_client_walkin_new")}
        </button>
      </header>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t("sale_client_filter_placeholder")}
          className="pl-9"
        />
      </div>
      <ul className="mt-3 max-h-[420px] divide-y divide-border overflow-y-auto rounded-md border border-border">
        {loadingList && allClients.length === 0 ? (
          <li className="px-3 py-3 text-sm text-muted">{t("sale_client_loading")}</li>
        ) : visibleClients.length === 0 ? (
          <li className="px-3 py-3 text-sm text-muted">{t("sale_client_no_results")}</li>
        ) : (
          visibleClients.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setClient(r)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-elevated"
              >
                <span className="grid size-8 place-items-center rounded-full bg-surface-elevated text-muted">
                  {r.account_type === "business" ? (
                    <Building2 className="size-4" />
                  ) : (
                    <User className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-medium">
                    {r.account_type === "business"
                      ? r.company_name ?? r.full_name ?? r.email
                      : r.full_name ?? r.email}
                  </div>
                  <div className="line-clamp-1 text-xs text-muted">
                    {r.email}
                    {r.phone ? ` · ${r.phone}` : ""}
                    {r.idno ? ` · IDNO ${r.idno}` : ""}
                  </div>
                </div>
                {r.discount_percent ? (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                    -{r.discount_percent}%
                  </span>
                ) : null}
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

// =====================================================================
// Step 3: products

// Fixed reference rates (MDL per 1 unit of foreign currency). Used to
// convert prices when the operator flips the wizard's currency picker so
// they don't have to re-enter every line. Owner asked for a predictable 20.
const RATES_TO_MDL: Record<"MDL" | "EUR" | "USD", number> = {
  MDL: 1,
  EUR: 20,
  USD: 17,
};

function convertPrice(
  value: number,
  from: "MDL" | "EUR" | "USD",
  to: "MDL" | "EUR" | "USD",
): number {
  if (from === to) return value;
  const inMdl = value * RATES_TO_MDL[from];
  const out = inMdl / RATES_TO_MDL[to];
  return Math.round(out * 100) / 100;
}

function StepProducts({
  lines,
  setLines,
  clientDiscount,
  saleMarkupPercent,
  setSaleMarkupPercent,
  currency,
  setCurrency,
}: {
  lines: Line[];
  setLines: (l: Line[]) => void;
  clientDiscount: number | null;
  saleMarkupPercent: string;
  setSaleMarkupPercent: (v: string) => void;
  currency: "MDL" | "EUR" | "USD";
  setCurrency: (v: "MDL" | "EUR" | "USD") => void;
}) {
  const t = useTranslations("panel");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [searching, startSearch] = useTransition();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    timer.current = window.setTimeout(() => {
      startSearch(async () => {
        const r = await searchProducts(q);
        setResults(r);
      });
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  // cost_price is stored in MDL; markup-derived price is therefore MDL too.
  function priceFromMarkup(costPrice: number): number | null {
    const trimmed = saleMarkupPercent.trim();
    if (trimmed === "") return null;
    const m = Number(trimmed);
    if (!Number.isFinite(m) || m < 0) return null;
    return Math.round(costPrice * (1 + m / 100) * 100) / 100;
  }

  function add(p: ProductSearchResult) {
    if (lines.some((l) => l.product.id === p.id)) {
      toast.info(t("sale_products_already_added"));
      return;
    }
    // Catalog price + cost are stored in MDL. Convert to the active wizard
    // currency before seeding the line so the operator sees consistent
    // numbers regardless of which book/currency they're billing in.
    const baseMdl =
      priceFromMarkup(p.cost_price) !== null
        ? priceFromMarkup(p.cost_price)! * RATES_TO_MDL[currency]
        : p.price;
    const unitPrice = convertPrice(baseMdl, "MDL", currency);
    setLines([
      ...lines,
      { product: p, qty: 1, unit_price: unitPrice, discounted_unit_price: null },
    ]);
    setQ("");
    setResults([]);
  }

  // Flipping the currency selector rescales every line so the value stays
  // economically equivalent (20 MDL ≡ 1 EUR ≡ 17 USD per fixed table).
  // Also persists the choice so the NEXT new-sale form opens with the
  // same currency — see the localStorage read at the wizard root.
  function changeCurrency(next: "MDL" | "EUR" | "USD") {
    if (next === currency) return;
    setLines(
      lines.map((l) => ({
        ...l,
        unit_price: convertPrice(l.unit_price, currency, next),
        discounted_unit_price:
          l.discounted_unit_price != null
            ? convertPrice(l.discounted_unit_price, currency, next)
            : null,
      })),
    );
    setCurrency(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("panel.sale.lastCurrency", next);
    }
  }

  function applyMarkupToAll(percent: string) {
    setSaleMarkupPercent(percent);
    const trimmed = percent.trim();
    if (trimmed === "") return;
    const m = Number(trimmed);
    if (!Number.isFinite(m) || m < 0) return;
    setLines(
      lines.map((l) => {
        // cost_price is MDL → markup result is MDL → convert to wizard
        // currency before assigning.
        const mdl = l.product.cost_price * (1 + m / 100);
        return {
          ...l,
          unit_price: convertPrice(mdl, "MDL", currency),
        };
      }),
    );
  }

  function update(idx: number, patch: Partial<Line>) {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function remove(idx: number) {
    setLines(lines.filter((_, i) => i !== idx));
  }

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-border bg-surface p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("sale_products_section")}
          </h3>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col">
              <span className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                {t("sale_currency_label")}
              </span>
              <select
                value={currency}
                onChange={(e) => changeCurrency(e.target.value as "MDL" | "EUR" | "USD")}
                className={cn(
                  "h-9 rounded-md border px-3 text-sm font-semibold transition-colors",
                  currency === "MDL"
                    ? "border-border bg-surface"
                    : "border-primary bg-primary/10 text-primary",
                )}
              >
                <option value="MDL">MDL</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                {t("sale_markup_label")}
              </span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  step={1}
                  min={0}
                  value={saleMarkupPercent}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    applyMarkupToAll(v === "" ? "" : String(Math.max(0, Math.trunc(Number(v) || 0))));
                  }}
                  placeholder="—"
                  className="h-9 w-24 text-right"
                />
                <span className="text-sm text-muted">%</span>
              </div>
            </label>
          </div>
        </div>
        <p className="mb-3 text-[11px] text-muted">{t("sale_markup_hint")}</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("sale_products_search_placeholder")}
            className="pl-9"
          />
          {searching ? (
            <span className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 animate-spin rounded-full border-2 border-border border-t-primary" />
          ) : null}
        </div>
        {results.length > 0 ? (
          <ul className="mt-3 divide-y divide-border rounded-md border border-border">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => add(p)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-elevated"
                >
                  <span className="font-mono text-xs text-muted">{p.part_code}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {p.name_ro ?? "—"}
                    {!p.is_active ? (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 align-middle text-[10px] uppercase tracking-wide text-amber-800">
                        draft
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-muted">
                    {t("sale_products_stock_label", { qty: p.stock_quantity })}
                  </span>
                  <span className="w-24 text-right tabular-nums text-sm">
                    {p.price.toFixed(2)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {lines.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          {t("sale_lines_empty")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">{t("sale_line_col_code")}</th>
                <th className="px-4 py-3">{t("sale_line_col_name")}</th>
                <th className="px-4 py-3">{t("sale_line_col_location")}</th>
                <th className="px-4 py-3 text-right">{t("sale_line_col_qty")}</th>
                <th className="px-4 py-3 text-right">{t("sale_line_col_price")}</th>
                <th className="px-4 py-3 text-right">{t("sale_line_col_discount_price")}</th>
                <th className="px-4 py-3 text-right">{t("sale_line_col_total")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {lines.map((l, idx) => {
                const hasDiscount =
                  l.discounted_unit_price != null &&
                  l.discounted_unit_price < l.unit_price;
                const effective = hasDiscount
                  ? (l.discounted_unit_price as number)
                  : l.unit_price;
                const linePct = hasDiscount
                  ? Math.max(0, (1 - effective / l.unit_price) * 100)
                  : 0;
                return (
                  <tr key={l.product.id}>
                    <td className="px-4 py-2 font-mono text-xs">{l.product.part_code}</td>
                    <td className="px-4 py-2">{l.product.name_ro}</td>
                    <td className="px-4 py-2 text-xs text-muted">
                      {l.product.storage_location ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Input
                        type="number"
                        step={1}
                        min={1}
                        max={l.product.stock_quantity}
                        value={l.qty}
                        onChange={(e) =>
                          update(idx, {
                            qty: Math.max(1, Math.trunc(Number(e.target.value || 0))),
                          })
                        }
                        className="ml-auto h-8 w-20 text-right"
                      />
                      <div className="text-[10px] text-muted">
                        {t("sale_products_stock_label", { qty: l.product.stock_quantity })}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <PriceWithVatHelper
                        value={l.unit_price}
                        onChange={(v) => update(idx, { unit_price: v })}
                        step="0.01"
                        size="sm"
                        inputClassName="ml-auto h-8 w-24 text-right"
                      />
                      {l.product.cost_price > 0 ? (
                        <div className="text-[10px] text-muted">
                          {t("sale_line_margin", {
                            pct: (
                              ((l.unit_price - l.product.cost_price) /
                                l.product.cost_price) *
                              100
                            ).toFixed(0),
                          })}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={l.discounted_unit_price ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          update(idx, {
                            discounted_unit_price:
                              raw === "" ? null : Math.max(0, Number(raw)),
                          });
                        }}
                        placeholder={l.unit_price.toFixed(2)}
                        className="ml-auto h-8 w-24 text-right"
                      />
                      {hasDiscount ? (
                        <div className="mt-0.5 text-[10px] font-semibold text-success">
                          -{Math.round(linePct)}%
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">
                      {hasDiscount ? (
                        <div className="text-[10px] text-muted line-through">
                          {(l.qty * l.unit_price).toFixed(2)}
                        </div>
                      ) : null}
                      <Price value={l.qty * effective} currency={currency} size="sm" accent={false} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-destructive hover:text-destructive/80"
                        aria-label={t("action_delete")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// =====================================================================
// Step 4: payment

function StepPayment({
  scope,
  paymentMethod,
  setPaymentMethod,
  currency,
  deliveryAddress,
  setDeliveryAddress,
  driverName,
  setDriverName,
  vehiclePlate,
  setVehiclePlate,
  notes,
  setNotes,
  vatAmount,
  setVatAmount,
  subtotal,
  subtotalBeforeDiscount,
  lineDiscountAmount,
  lineDiscountPct,
  fallbackAddress,
}: {
  scope: Scope;
  paymentMethod: "cash" | "transfer" | "already_paid";
  setPaymentMethod: (v: "cash" | "transfer" | "already_paid") => void;
  currency: "MDL" | "EUR" | "USD";
  deliveryAddress: string;
  setDeliveryAddress: (v: string) => void;
  driverName: string;
  setDriverName: (v: string) => void;
  vehiclePlate: string;
  setVehiclePlate: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  vatAmount: string;
  setVatAmount: (v: string) => void;
  subtotal: number;
  subtotalBeforeDiscount: number;
  lineDiscountAmount: number;
  lineDiscountPct: number;
  fallbackAddress: string;
}) {
  const t = useTranslations("panel");
  useEffect(() => {
    if (!deliveryAddress && fallbackAddress) {
      setDeliveryAddress(fallbackAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // VAT is reactive to the typed amount; the line discount values come from
  // the parent (single source of truth = the lines themselves).
  const liveVat =
    scope === "conta2" || vatAmount.trim() === "" ? 0 : Math.max(0, Number(vatAmount) || 0);
  const liveTotal = Number((subtotal + liveVat).toFixed(2));

  const methods: Array<{ v: "cash" | "transfer" | "already_paid"; label: string }> = [
    { v: "cash", label: t("sale_pay_cash") },
    { v: "transfer", label: t("sale_pay_transfer") },
    { v: "already_paid", label: t("sale_pay_already_paid") },
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("sale_payment_section")}
        </h3>
        <div className="grid gap-2 md:grid-cols-3">
          {methods.map((m) => (
            <button
              key={m.v}
              type="button"
              onClick={() => setPaymentMethod(m.v)}
              className={cn(
                "flex items-center gap-2 rounded-md border-2 px-4 py-3 text-sm transition-colors",
                paymentMethod === m.v
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface hover:border-primary/40",
              )}
            >
              <Wallet className="size-4" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("sale_delivery_section")}
        </h3>
        <div className="grid gap-3">
          <Field label={t("sale_delivery_address")} required>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              placeholder={t("sale_delivery_address_placeholder")}
            />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t("sale_driver")}>
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder={t("sale_driver_placeholder")}
              />
            </Field>
            <Field label={t("sale_plate")}>
              <Input
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                placeholder={t("sale_plate_placeholder")}
                className="font-mono uppercase"
              />
            </Field>
          </div>
          <Field label={t("sale_notes")}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              placeholder={t("sale_notes_placeholder")}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("sale_totals_section")}
        </h3>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <Field
            label={t("sale_vat_label")}
            hint={scope === "conta2" ? t("sale_vat_locked_conta2") : t("sale_vat_hint")}
          >
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              value={scope === "conta2" ? "0" : vatAmount}
              onChange={(e) => setVatAmount(e.target.value)}
              disabled={scope === "conta2"}
              placeholder="0.00"
              className="md:max-w-xs disabled:cursor-not-allowed disabled:bg-surface-elevated disabled:text-muted"
            />
          </Field>
          <dl className="grid gap-1 text-sm md:justify-self-end md:text-right">
            {lineDiscountPct > 0 ? (
              <>
                <div className="flex justify-between gap-6">
                  <dt className="text-muted">{t("sale_review_subtotal_before_discount")}</dt>
                  <dd className="tabular-nums text-muted line-through">
                    {subtotalBeforeDiscount.toFixed(2)} {currency}
                  </dd>
                </div>
                <div className="flex justify-between gap-6 text-success">
                  <dt>{t("sale_discount_line_label", { percent: Math.round(lineDiscountPct) })}</dt>
                  <dd className="tabular-nums">-{lineDiscountAmount.toFixed(2)} {currency}</dd>
                </div>
              </>
            ) : null}
            <div className="flex justify-between gap-6">
              <dt className="text-muted">{t("sale_review_total")}</dt>
              <dd className="tabular-nums">{subtotal.toFixed(2)} {currency}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-muted">{t("sale_vat_label")}</dt>
              <dd className="tabular-nums">
                {liveVat.toFixed(2)} {currency}
              </dd>
            </div>
            <div className="flex justify-between gap-6 border-t border-border pt-1 font-semibold">
              <dt>{t("sale_total_label")}</dt>
              <dd className="tabular-nums">
                {liveTotal.toFixed(2)} {currency}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// Step 5: review

function StepReview({
  scope,
  client,
  walkin,
  lines,
  paymentMethod,
  deliveryAddress,
  driverName,
  vehiclePlate,
  notes,
  subtotal,
  subtotalBeforeDiscount,
  lineDiscountAmount,
  lineDiscountPct,
  vatAmount,
  grandTotal,
  currency,
}: {
  scope: Scope;
  client: ClientSearchResult | null;
  walkin: WalkIn | null;
  lines: Line[];
  paymentMethod: string;
  deliveryAddress: string;
  driverName: string;
  vehiclePlate: string;
  notes: string;
  subtotal: number;
  subtotalBeforeDiscount: number;
  lineDiscountAmount: number;
  lineDiscountPct: number;
  vatAmount: number;
  grandTotal: number;
  currency: "MDL" | "EUR" | "USD";
}) {
  const t = useTranslations("panel");
  const payLabel = t(`sale_pay_${paymentMethod}` as "sale_pay_cash");
  return (
    <section className="space-y-4">
      <div className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("sale_review_section")}
        </h3>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <Row label={t("sale_review_book")}>
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs font-semibold",
                scope === "conta1"
                  ? "bg-primary/15 text-primary"
                  : "bg-warning/15 text-warning",
              )}
            >
              {scope === "conta1" ? t("sale_review_book_conta1") : t("sale_review_book_conta2")}
            </span>
          </Row>
          <Row label={t("sale_review_client")}>
            {client
              ? client.account_type === "business"
                ? client.company_name ?? client.full_name ?? client.email
                : client.full_name ?? client.email
              : walkin?.name ?? "—"}
          </Row>
          <Row label={t("sale_review_payment")}>{payLabel}</Row>
          <Row label={t("sale_review_delivery")}>{deliveryAddress}</Row>
          {driverName ? <Row label={t("sale_review_driver")}>{driverName}</Row> : null}
          {vehiclePlate ? <Row label={t("sale_review_vehicle")}>{vehiclePlate}</Row> : null}
          {notes ? <Row label={t("sale_review_notes")}>{notes}</Row> : null}
        </dl>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">{t("sale_review_col_product")}</th>
              <th className="px-4 py-3 text-right">{t("sale_review_col_qty")}</th>
              <th className="px-4 py-3 text-right">{t("sale_review_col_price")}</th>
              <th className="px-4 py-3 text-right">{t("sale_review_col_total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {lines.map((l) => {
              const hasDiscount =
                l.discounted_unit_price != null &&
                l.discounted_unit_price < l.unit_price;
              const effective = hasDiscount
                ? (l.discounted_unit_price as number)
                : l.unit_price;
              const linePct = hasDiscount
                ? Math.max(0, (1 - effective / l.unit_price) * 100)
                : 0;
              return (
                <tr key={l.product.id}>
                  <td className="px-4 py-2">
                    <div className="font-mono text-xs">{l.product.part_code}</div>
                    <div className="text-sm">{l.product.name_ro}</div>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{l.qty}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {hasDiscount ? (
                      <>
                        <span className="mr-1 text-muted line-through">
                          {l.unit_price.toFixed(2)}
                        </span>
                        <span className="font-semibold text-success">
                          {effective.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-success">
                          -{Math.round(linePct)}%
                        </div>
                      </>
                    ) : (
                      <>{l.unit_price.toFixed(2)} {currency}</>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold">
                    <Price value={l.qty * effective} currency={currency} size="sm" accent={false} />
                  </td>
                </tr>
              );
            })}
            {lineDiscountPct > 0 ? (
              <>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right text-xs text-muted">
                    {t("sale_review_subtotal_before_discount")}
                  </td>
                  <td className="px-4 py-2 text-right text-sm tabular-nums text-muted line-through">
                    {subtotalBeforeDiscount.toFixed(2)} {currency}
                  </td>
                </tr>
                <tr className="text-success">
                  <td colSpan={3} className="px-4 py-2 text-right text-xs">
                    {t("sale_discount_line_label", { percent: Math.round(lineDiscountPct) })}
                  </td>
                  <td className="px-4 py-2 text-right text-sm tabular-nums">
                    -{lineDiscountAmount.toFixed(2)} {currency}
                  </td>
                </tr>
              </>
            ) : null}
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right text-xs text-muted">
                {t("sale_review_total")}
              </td>
              <td className="px-4 py-2 text-right text-sm tabular-nums">
                {subtotal.toFixed(2)} {currency}
              </td>
            </tr>
            {vatAmount > 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right text-xs text-muted">
                  {t("sale_vat_label")}
                </td>
                <td className="px-4 py-2 text-right text-sm tabular-nums">
                  {vatAmount.toFixed(2)} {currency}
                </td>
              </tr>
            ) : null}
            <tr className="bg-surface-elevated">
              <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wide text-muted">
                {t("sale_total_label")}
              </td>
              <td className="px-4 py-3 text-right text-base font-bold">
                <Price value={grandTotal} currency={currency} size="md" accent={false} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

// =====================================================================
// Shared

function Stepper({
  current,
  steps,
}: {
  current: number;
  steps: Array<{ id: number; label: string }>;
}) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const reached = current >= s.id;
        const isLast = i === steps.length - 1;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                reached
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted",
              )}
            >
              {current > s.id ? <Check className="size-3.5" /> : s.id}
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                reached ? "text-foreground" : "text-muted",
              )}
            >
              {s.label}
            </span>
            {!isLast ? (
              <span
                className={cn(
                  "h-px flex-1",
                  current > s.id ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-right text-sm">{children}</dd>
    </div>
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
