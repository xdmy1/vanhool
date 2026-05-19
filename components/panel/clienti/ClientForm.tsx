"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createPanelClient,
  updatePanelClient,
  type PanelClientInput,
} from "@/lib/panel/clienti/actions";
import type { PanelClientDetail } from "@/lib/panel/clienti/queries";
import { cn } from "@/lib/utils/cn";

type Props = {
  locale: string;
  initial?: PanelClientDetail | null;
};

const EMPTY: PanelClientInput = {
  account_type: "individual",
  email: "",
  full_name: "",
  first_name: "",
  last_name: "",
  phone: "",
  company_name: "",
  idno: "",
  legal_form: "",
  contact_position: "",
  vat_code: "",
  discount_percent: 0,
  language: "ro",
  billing_country: "Republica Moldova",
  billing_street: "",
  billing_city: "",
  billing_district: "",
  billing_postal: "",
  shipping_same_as_billing: true,
  shipping_country: "",
  shipping_street: "",
  shipping_city: "",
  shipping_district: "",
  shipping_postal: "",
};

export function ClientForm({ locale, initial }: Props) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [state, setState] = useState<PanelClientInput>(() => ({
    ...EMPTY,
    ...(initial
      ? {
          account_type: initial.account_type ?? "individual",
          email: initial.email ?? "",
          full_name: initial.full_name ?? "",
          phone: initial.phone ?? "",
          company_name: initial.company_name ?? "",
          idno: initial.idno ?? "",
          legal_form: initial.legal_form ?? "",
          vat_code: initial.vat_code ?? "",
          discount_percent: initial.discount_percent ?? 0,
          billing_country: initial.billing_country ?? "Republica Moldova",
          billing_street: initial.billing_street ?? "",
          billing_city: initial.billing_city ?? "",
          billing_district: initial.billing_district ?? "",
          billing_postal: initial.billing_postal ?? "",
          shipping_same_as_billing: initial.shipping_same_as_billing ?? true,
          shipping_country: initial.shipping_country ?? "",
          shipping_street: initial.shipping_street ?? "",
          shipping_city: initial.shipping_city ?? "",
          shipping_district: initial.shipping_district ?? "",
          shipping_postal: initial.shipping_postal ?? "",
        }
      : {}),
  }));

  function set<K extends keyof PanelClientInput>(
    k: K,
    v: PanelClientInput[K],
  ) {
    setState((s) => ({ ...s, [k]: v }));
  }

  function submit() {
    startTransition(async () => {
      const res = initial
        ? await updatePanelClient(initial.id, state)
        : await createPanelClient(state);
      if (res.ok) {
        toast.success(initial ? t("client_form_updated") : t("client_form_created"));
        if (!initial && "id" in res) {
          router.push(`/${locale}/panel/clienti/${res.id}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error(t("client_form_error", { reason: res.reason }));
      }
    });
  }

  const isBusiness = state.account_type === "business";

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("client_form_section_type")}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <TypeCard
            active={state.account_type === "individual"}
            label={t("clienti_type_b2c")}
            sub={t("client_form_type_individual_sub")}
            onClick={() => set("account_type", "individual")}
          />
          <TypeCard
            active={state.account_type === "business"}
            label={t("clienti_type_b2b")}
            sub={t("client_form_type_business_sub")}
            onClick={() => set("account_type", "business")}
          />
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("client_form_section_contact")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {isBusiness ? (
            <>
              <Field label={t("sale_client_walkin_company")} required>
                <Input
                  value={state.company_name ?? ""}
                  onChange={(e) => set("company_name", e.target.value)}
                  placeholder="ex. MITS Automotive bv"
                />
              </Field>
              <Field label={t("clienti_detail_label_legal_form")}>
                <Input
                  value={state.legal_form ?? ""}
                  onChange={(e) => set("legal_form", e.target.value)}
                  placeholder="SRL, SA, GmbH, Ltd…"
                />
              </Field>
              <Field label={t("client_form_field_contact_name")}>
                <Input
                  value={state.full_name ?? ""}
                  onChange={(e) => set("full_name", e.target.value)}
                  placeholder="ex. Adrian Oborocean"
                />
              </Field>
              <Field label={t("client_form_field_contact_position")}>
                <Input
                  value={state.contact_position ?? ""}
                  onChange={(e) => set("contact_position", e.target.value)}
                  placeholder="ex. Administrator, Manager achiziții"
                />
              </Field>
            </>
          ) : (
            <Field label={t("sale_client_walkin_name")} required>
              <Input
                value={state.full_name ?? ""}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="ex. Ion Popescu"
              />
            </Field>
          )}
          <Field label={t("sale_client_walkin_email")}>
            <Input
              type="email"
              value={state.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              placeholder={t("client_form_email_placeholder")}
            />
          </Field>
          <Field label={t("sale_client_walkin_phone")}>
            <Input
              value={state.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+373 ..."
            />
          </Field>
        </div>
      </section>

      {isBusiness ? (
        <section className="rounded-md border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            {t("client_form_section_fiscal")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="IDNO">
              <Input
                value={state.idno ?? ""}
                onChange={(e) => set("idno", e.target.value)}
                placeholder="13 cifre (Moldova) sau VAT international"
                className="font-mono"
              />
            </Field>
            <Field label={t("proforma_form_customer_vat")}>
              <Input
                value={state.vat_code ?? ""}
                onChange={(e) => set("vat_code", e.target.value)}
                placeholder="ex. BE 0776.852.808"
                className="font-mono"
              />
            </Field>
            <Field label={t("client_form_discount")}>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.5"
                value={state.discount_percent ?? 0}
                onChange={(e) =>
                  set(
                    "discount_percent",
                    Math.max(0, Math.min(100, Number(e.target.value || 0))),
                  )
                }
              />
              <p className="mt-1 text-xs text-muted">{t("client_form_discount_help")}</p>
            </Field>
          </div>
        </section>
      ) : (
        <section className="rounded-md border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            {t("client_form_section_loyalty")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("client_form_discount")}>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.5"
                value={state.discount_percent ?? 0}
                onChange={(e) =>
                  set(
                    "discount_percent",
                    Math.max(0, Math.min(100, Number(e.target.value || 0))),
                  )
                }
              />
              <p className="mt-1 text-xs text-muted">{t("client_form_discount_help")}</p>
            </Field>
          </div>
        </section>
      )}

      <section className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("client_form_section_billing")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("client_form_field_country")}>
            <Input
              value={state.billing_country ?? ""}
              onChange={(e) => set("billing_country", e.target.value)}
            />
          </Field>
          <Field label={t("client_form_field_city")}>
            <Input
              value={state.billing_city ?? ""}
              onChange={(e) => set("billing_city", e.target.value)}
              placeholder="ex. Chișinău"
            />
          </Field>
          <Field label={t("client_form_field_street")}>
            <Input
              value={state.billing_street ?? ""}
              onChange={(e) => set("billing_street", e.target.value)}
              placeholder="ex. str. Liviu Deleanu 10/19, ap. 28"
            />
          </Field>
          <Field label={t("client_form_field_district")}>
            <Input
              value={state.billing_district ?? ""}
              onChange={(e) => set("billing_district", e.target.value)}
            />
          </Field>
          <Field label={t("client_form_field_postal")}>
            <Input
              value={state.billing_postal ?? ""}
              onChange={(e) => set("billing_postal", e.target.value)}
              placeholder="MD-2071"
            />
          </Field>
        </div>
        <label className="mt-4 inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.shipping_same_as_billing}
            onChange={(e) => set("shipping_same_as_billing", e.target.checked)}
          />
          {t("client_form_shipping_same")}
        </label>
      </section>

      {!state.shipping_same_as_billing ? (
        <section className="rounded-md border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            {t("client_form_section_shipping")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("client_form_field_country")}>
              <Input
                value={state.shipping_country ?? ""}
                onChange={(e) => set("shipping_country", e.target.value)}
              />
            </Field>
            <Field label={t("client_form_field_city")}>
              <Input
                value={state.shipping_city ?? ""}
                onChange={(e) => set("shipping_city", e.target.value)}
              />
            </Field>
            <Field label={t("client_form_field_street")}>
              <Input
                value={state.shipping_street ?? ""}
                onChange={(e) => set("shipping_street", e.target.value)}
              />
            </Field>
            <Field label={t("client_form_field_district")}>
              <Input
                value={state.shipping_district ?? ""}
                onChange={(e) => set("shipping_district", e.target.value)}
              />
            </Field>
            <Field label={t("client_form_field_postal")}>
              <Input
                value={state.shipping_postal ?? ""}
                onChange={(e) => set("shipping_postal", e.target.value)}
              />
            </Field>
          </div>
        </section>
      ) : null}

      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={pending} className="gap-1.5">
          <Save className="size-4" />
          {pending
            ? t("action_saving")
            : initial
              ? t("action_save")
              : t("client_form_submit")}
        </Button>
      </div>
    </div>
  );
}

function TypeCard({
  active,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border-2 bg-surface p-4 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
      )}
    >
      <div className="text-base font-semibold">{label}</div>
      <div className="mt-1 text-xs text-muted">{sub}</div>
    </button>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  );
}
