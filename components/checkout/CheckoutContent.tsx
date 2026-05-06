"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Banknote, ChevronRight, CreditCard, FileText, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/Container";
import { Price } from "@/components/common/Price";
import { PartImage } from "@/components/common/PartImage";
import { useCart } from "@/lib/cart/store";
import { calcTotals } from "@/lib/cart/pricing";
import { CART_CONFIG } from "@/lib/cart/types";
import { PHONE_PREFIXES, PAYMENT_METHODS } from "@/lib/validation/checkout";
import { createOrder } from "@/lib/orders/actions";
import { cn } from "@/lib/utils/cn";

const PAYMENT_ICONS = {
  paynet: CreditCard,
  cash: Banknote,
  transfer: FileText,
} as const;

export function CheckoutContent({
  locale,
  user,
}: {
  locale: string;
  user: {
    email: string | null;
    fullName: string | null;
    phone: string | null;
  };
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const promo = useCart((s) => s.promo);
  const isHydrated = useCart((s) => s.isHydrated);
  const clear = useCart((s) => s.clear);

  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");

  const totals = useMemo(() => calcTotals(items, promo), [items, promo]);

  // Pre-split user.phone if it starts with a known prefix
  const initialPhone = useMemo(() => {
    const phone = user.phone ?? "";
    for (const p of PHONE_PREFIXES) {
      if (phone.startsWith(p.code)) {
        return { code: p.code, number: phone.slice(p.code.length).trim() };
      }
    }
    return { code: "+373", number: phone };
  }, [user.phone]);

  const [phoneCountry, setPhoneCountry] = useState(initialPhone.code);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.number);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>("cash");

  // Pre-fill from user profile
  const initialName = (user.fullName ?? "").split(" ");
  const initialFirst = initialName[0] ?? "";
  const initialLast = initialName.slice(1).join(" ") ?? "";

  // Redirect to cart if empty (after hydration)
  useEffect(() => {
    if (isHydrated && items.length === 0) {
      router.replace(`/${locale}/cart`);
    }
  }, [isHydrated, items.length, locale, router]);

  if (!isHydrated || items.length === 0) {
    return (
      <Container className="py-20">
        <div className="flex justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </Container>
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phoneCountry,
      phoneNumber,
      city: String(fd.get("city") ?? "").trim(),
      postal: String(fd.get("postal") ?? "").trim(),
      address: String(fd.get("address") ?? "").trim(),
      notes: String(fd.get("notes") ?? "").trim(),
      paymentMethod,
      terms: fd.get("terms") === "on" ? (true as const) : false,
      promoCode: promo?.code ?? "",
      items: items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        name: i.name,
        partCode: i.partCode,
        brand: i.brand,
        price: i.price,
        quantity: i.quantity,
      })),
    };

    const errs: Record<string, string> = {};
    if (!payload.firstName) errs.firstName = t("validation_required");
    if (!payload.lastName) errs.lastName = t("validation_required");
    if (!payload.email.includes("@")) errs.email = t("validation_email");
    if (!payload.phoneNumber || payload.phoneNumber.length < 5) errs.phoneNumber = t("validation_phone");
    if (!payload.address) errs.address = t("validation_required");
    if (!payload.city) errs.city = t("validation_required");
    if (payload.terms !== true) errs.terms = t("validation_terms");
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    startTransition(async () => {
      const result = await createOrder(payload);
      if (!result.ok) {
        toast.error(t("submit_error"));
        setErrors({ root: result.message ?? t("submit_error") });
        return;
      }
      clear();
      router.replace(`/${locale}/thank-you?order=${result.orderId}`);
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]" noValidate>
      <div className="flex min-w-0 flex-col gap-6">
        {/* CONTACT */}
        <Section step="01" title={t("section_contact")}>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("first_name")} error={errors.firstName}>
              <Input name="firstName" defaultValue={initialFirst} required />
            </Field>
            <Field label={t("last_name")} error={errors.lastName}>
              <Input name="lastName" defaultValue={initialLast} required />
            </Field>
          </div>
          <Field label={t("email")} error={errors.email}>
            <Input name="email" type="email" defaultValue={user.email ?? ""} required />
          </Field>
          <Field label={t("phone")} error={errors.phoneNumber}>
            <div className="flex items-stretch gap-2">
              <select
                value={phoneCountry}
                onChange={(e) => setPhoneCountry(e.target.value)}
                className="rounded-md border border-border bg-surface px-3 font-mono text-sm outline-none transition-colors focus:border-primary"
              >
                {PHONE_PREFIXES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.flag} {p.code}
                  </option>
                ))}
              </select>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="68 123 456"
                inputMode="tel"
                required
              />
            </div>
          </Field>
        </Section>

        {/* DELIVERY */}
        <Section step="02" title={t("section_delivery")}>
          <Field label={t("address")} error={errors.address}>
            <Input name="address" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("city")} error={errors.city}>
              <Input name="city" required />
            </Field>
            <Field label={t("postal")}>
              <Input name="postal" />
            </Field>
          </div>
          <Field label={t("notes")}>
            <textarea
              name="notes"
              rows={3}
              placeholder={t("notes_placeholder")}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
            />
          </Field>
        </Section>

        {/* PAYMENT */}
        <Section step="03" title={t("section_payment")}>
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = PAYMENT_ICONS[m];
              const labelKey = `payment_${m}` as "payment_paynet";
              const descKey = `payment_${m}_desc` as "payment_paynet_desc";
              const checked = paymentMethod === m;
              return (
                <label
                  key={m}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors",
                    checked
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface hover:border-border-strong",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m}
                    checked={checked}
                    onChange={() => setPaymentMethod(m)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-sm border",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-accent-dark text-primary",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{t(labelKey)}</div>
                    <div className="text-xs text-muted-strong">{t(descKey)}</div>
                  </div>
                  <span
                    className={cn(
                      "size-5 shrink-0 rounded-full border-2",
                      checked ? "border-primary bg-primary" : "border-border",
                    )}
                  />
                </label>
              );
            })}
          </div>
        </Section>

        {/* TERMS */}
        <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-surface p-4 text-sm">
          <input type="checkbox" name="terms" required className="mt-0.5 size-4 accent-primary" />
          <span className="text-muted-strong">
            {t("terms_label")}
            {errors.terms ? <span className="ml-1 text-destructive">*</span> : null}
          </span>
        </label>

        {errors.root ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {errors.root}
          </div>
        ) : null}
      </div>

      {/* SUMMARY SIDEBAR */}
      <aside className="flex flex-col gap-4">
        <div className="rounded-md border border-border bg-surface p-5">
          <h2 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
            {t("summary_title")}
          </h2>

          <div className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex items-start gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-sm border border-border bg-accent-dark">
                  <PartImage variant={item.illustration} />
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-border bg-background font-mono text-[10px] font-bold tabular-nums text-foreground">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    {item.brand} · {item.partCode}
                  </div>
                  <div className="line-clamp-2 text-xs font-semibold">{item.name}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted">
                    {item.quantity} × €{item.price.toFixed(2)}
                  </div>
                </div>
                <div className="shrink-0 font-mono text-sm tabular-nums">
                  €{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <Row label={tCart("subtotal")} value={`€${totals.subtotal.toFixed(2)}`} />
            {totals.discount > 0 ? (
              <Row
                label={`${tCart("discount")}${promo ? ` · ${promo.code}` : ""}`}
                value={`-€${totals.discount.toFixed(2)}`}
                tone="success"
              />
            ) : null}
            <Row
              label={tCart("shipping")}
              value={
                totals.shipping === 0 ? (
                  <span className="font-mono text-success">{tCart("free")}</span>
                ) : (
                  `€${totals.shipping.toFixed(2)}`
                )
              }
            />
          </dl>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em]">
              {tCart("total")}
            </span>
            <Price value={totals.total} size="xl" />
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full uppercase tracking-wider"
            disabled={pending}
          >
            {pending ? t("submit_processing") : t("submit")}
            {!pending ? <ChevronRight className="size-4" /> : null}
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-xs text-muted-strong">
          <Truck className="size-4 text-primary" />
          <span>
            {totals.shipping === 0
              ? tCart("free_shipping_hint")
              : `${tCart("almost_free_shipping", { remaining: `€${(CART_CONFIG.freeShippingThreshold - (totals.subtotal - totals.discount)).toFixed(2)}` })}`}
          </span>
        </div>
      </aside>
    </form>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-sm border border-primary/40 bg-primary/10 font-mono text-xs font-bold text-primary">
          {step}
        </span>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
        {error ? <span className="ml-1 text-destructive">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function Row({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "success";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd
        className={cn(
          "font-mono tabular-nums",
          tone === "success" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
