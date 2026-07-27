"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, KeyRound, Copy, Check } from "lucide-react";
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
  // Credentials to show once after provisioning a B2B login.
  const [createdLogin, setCreatedLogin] = useState<{
    id: string;
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

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
        const newId = (res as { id?: string }).id;
        const login = (res as { login?: { email: string; password: string } }).login;
        // If a B2B login was provisioned, show the credentials once (the
        // password is never retrievable again) before leaving the page.
        if (!initial && newId && login) {
          setCreatedLogin({ id: newId, ...login });
        } else if (!initial && newId) {
          router.push(`/${locale}/panel/clienti/${newId}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error(t("client_form_error", { reason: res.reason }));
      }
    });
  }

  const isBusiness = state.account_type === "business";

  // One-time credentials panel — shown after a B2B login is provisioned.
  if (createdLogin) {
    const block = `Site: inter-bus.md\nEmail: ${createdLogin.email}\nParolă: ${createdLogin.password}`;
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-primary/40 bg-primary/5 p-6">
        <div className="flex items-center gap-2 text-primary">
          <KeyRound className="size-5" />
          <h3 className="text-base font-semibold">Cont B2B creat</h3>
        </div>
        <p className="mt-2 text-sm text-muted-strong">
          Transmite aceste date clientului. <strong>Parola nu mai poate fi
          revăzută</strong> — copiaz-o acum.
        </p>
        <div className="mt-4 space-y-2 rounded-md border border-border bg-surface p-4 font-mono text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted">Email</span>
            <span className="font-semibold">{createdLogin.email}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">Parolă</span>
            <span className="font-semibold">{createdLogin.password}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            onClick={() => {
              navigator.clipboard?.writeText(block).then(() => {
                setCopied(true);
                toast.success("Copiat");
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="gap-1.5"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copiat" : "Copiază datele"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/panel/clienti/${createdLogin.id}`)}
          >
            Mergi la client
          </Button>
        </div>
      </div>
    );
  }

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
          {/* B2B login — only on create, only when a real email is present. */}
          {!initial ? (
            <div className="sm:col-span-2">
              <label
                className={cn(
                  "flex items-start gap-2.5 rounded-md border p-3 transition-colors",
                  state.email && state.email.includes("@")
                    ? "cursor-pointer border-primary/30 bg-primary/5"
                    : "cursor-not-allowed border-border bg-surface opacity-60",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-4"
                  disabled={!state.email || !state.email.includes("@")}
                  checked={!!state.generate_login}
                  onChange={(e) => set("generate_login", e.target.checked)}
                />
                <span className="text-sm">
                  <span className="font-medium">Creează cont de login (B2B)</span>
                  <span className="block text-xs text-muted">
                    Generează o parolă pe care i-o dai clientului ca să intre pe
                    inter-bus.md. Necesită un email real.
                  </span>
                </span>
              </label>
            </div>
          ) : null}
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
