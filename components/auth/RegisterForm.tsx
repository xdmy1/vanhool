"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/i18n/routing";
import { signUp } from "@/lib/auth/actions";
import type { Locale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { CheckEmailPanel } from "./CheckEmailPanel";

type Labels = {
  // Account type tabs
  accountTypeIndividual: string;
  accountTypeBusiness: string;
  // Shared fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  // Business sections
  sectionCompany: string;
  sectionContact: string;
  sectionShipping: string;
  sectionFiscal: string;
  // Business fields
  companyName: string;
  idno: string;
  legalForm: string;
  legalFormHint: string;
  country: string;
  street: string;
  city: string;
  district: string;
  postal: string;
  contactPosition: string;
  shippingSameAsBilling: string;
  vatPayer: string;
  vatNumber: string;
  euVatId: string;
  euVatIdHint: string;
  // Shared
  company: string;
  submit: string;
  haveAccount: string;
  loginNow: string;
  termsAccept: string;
  marketingAccept: string;
  errorEmailExists: string;
  errorPasswordsMismatch: string;
  errorUnknown: string;
  registerCheckEmail: string;
  checkEmailTitle: string;
  checkEmailBodyPrefix: string;
  checkEmailBodySuffix: string;
  checkEmailSpamHint: string;
  resend: string;
  resendSending: string;
  resendSent: string;
  rateLimited: string;
  backToLogin: string;
};

type AccountType = "individual" | "business";

const COUNTRIES = [
  { code: "MD", labelRo: "Republica Moldova" },
  { code: "RO", labelRo: "România" },
  { code: "UA", labelRo: "Ucraina" },
  { code: "OTHER", labelRo: "Altă țară" },
];

export function RegisterForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [shippingSame, setShippingSame] = useState(true);
  const [vatPayer, setVatPayer] = useState(false);
  const [billingCountry, setBillingCountry] = useState("MD");

  if (pendingEmail) {
    return (
      <CheckEmailPanel
        email={pendingEmail}
        locale={locale}
        labels={{
          title: labels.checkEmailTitle,
          body_prefix: labels.checkEmailBodyPrefix,
          body_suffix: labels.checkEmailBodySuffix,
          spam_hint: labels.checkEmailSpamHint,
          resend: labels.resend,
          resend_sending: labels.resendSending,
          resend_sent: labels.resendSent,
          rate_limited: labels.rateLimited,
          back_to_login: labels.backToLogin,
          generic_error: labels.errorUnknown,
        }}
      />
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();

    const data = {
      firstName: get("firstName"),
      lastName: get("lastName"),
      email: get("email"),
      phone: get("phone"),
      password: String(fd.get("password") ?? ""),
      passwordConfirm: String(fd.get("passwordConfirm") ?? ""),
      terms: fd.get("terms") === "on",
      marketingOptIn: fd.get("marketing") === "on",
    };

    const errs: Record<string, string> = {};
    if (!data.firstName) errs.firstName = "*";
    if (!data.lastName) errs.lastName = "*";
    if (!data.email || !data.email.includes("@")) errs.email = "*";
    const phoneDigits = data.phone.replace(/\D/g, "");
    if (!data.phone || phoneDigits.length < 7) errs.phone = "*";
    if (data.password.length < 8) errs.password = "≥ 8";
    if (data.password !== data.passwordConfirm) errs.passwordConfirm = labels.errorPasswordsMismatch;
    if (!data.terms) errs.terms = "*";

    let business: Parameters<typeof signUp>[0]["business"] = undefined;
    if (accountType === "business") {
      const companyName = get("companyName");
      const idno = get("idno");
      const billingStreet = get("billingStreet");
      const billingCity = get("billingCity");
      if (!companyName) errs.companyName = "*";
      if (!idno) errs.idno = "*";
      if (!billingStreet) errs.billingStreet = "*";
      if (!billingCity) errs.billingCity = "*";

      const vatNumber = get("vatNumber");
      if (vatPayer && !vatNumber) errs.vatNumber = "*";

      business = {
        companyName,
        idno,
        legalForm: get("legalForm") || undefined,
        contactPosition: get("contactPosition") || undefined,
        billingCountry,
        billingStreet,
        billingCity,
        billingDistrict: get("billingDistrict") || undefined,
        billingPostal: get("billingPostal") || undefined,
        shippingSameAsBilling: shippingSame,
        shippingCountry: shippingSame ? undefined : get("shippingCountry"),
        shippingStreet: shippingSame ? undefined : get("shippingStreet"),
        shippingCity: shippingSame ? undefined : get("shippingCity"),
        shippingDistrict: shippingSame ? undefined : get("shippingDistrict"),
        shippingPostal: shippingSame ? undefined : get("shippingPostal"),
        vatPayer,
        vatNumber: vatPayer ? vatNumber : undefined,
        euVatId: get("euVatId") || undefined,
      };
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    startTransition(async () => {
      const result = await signUp({
        accountType,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        marketingOptIn: data.marketingOptIn,
        language: locale,
        business,
      });
      if (!result.ok) {
        const msg =
          result.code === "email_exists"
            ? labels.errorEmailExists
            : labels.errorUnknown;
        setErrors({ root: msg });
        toast.error(msg);
        return;
      }
      if (result.requiresEmailConfirmation) {
        setPendingEmail(data.email);
        toast.success(labels.registerCheckEmail);
        return;
      }
      toast.success(labels.registerCheckEmail);
      router.replace(`/${locale}/dashboard`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* Account type tabs */}
      <div
        role="tablist"
        aria-label="Tip cont"
        className="grid grid-cols-2 gap-1 rounded-md border border-border bg-surface p-1"
      >
        <TabBtn
          active={accountType === "individual"}
          onClick={() => setAccountType("individual")}
          label={labels.accountTypeIndividual}
        />
        <TabBtn
          active={accountType === "business"}
          onClick={() => setAccountType("business")}
          label={labels.accountTypeBusiness}
        />
      </div>

      {/* Shared: contact person */}
      {accountType === "business" ? (
        <SectionTitle>{labels.sectionContact}</SectionTitle>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Field label={labels.firstName} error={errors.firstName}>
          <Input name="firstName" autoComplete="given-name" required />
        </Field>
        <Field label={labels.lastName} error={errors.lastName}>
          <Input name="lastName" autoComplete="family-name" required />
        </Field>
      </div>

      {accountType === "business" ? (
        <Field label={labels.contactPosition}>
          <Input name="contactPosition" placeholder="Administrator, Manager achiziții…" />
        </Field>
      ) : null}

      <Field label={labels.email} error={errors.email}>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label={labels.phone} error={errors.phone}>
        <Input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+373 ..."
          required
          inputMode="tel"
        />
      </Field>

      {/* Business: company section */}
      {accountType === "business" ? (
        <>
          <SectionTitle>{labels.sectionCompany}</SectionTitle>
          <Field label={labels.companyName} error={errors.companyName}>
            <Input name="companyName" placeholder="S.R.L. DAVO GROUP" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={labels.idno} error={errors.idno}>
              <Input name="idno" placeholder="1234567890123" required />
            </Field>
            <Field label={labels.legalForm} hint={labels.legalFormHint}>
              <Input name="legalForm" placeholder="SRL, SA, II, PFA, LTD…" />
            </Field>
          </div>

          <Field label={labels.country}>
            <select
              value={billingCountry}
              onChange={(e) => setBillingCountry(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.labelRo}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.street} error={errors.billingStreet}>
            <Input name="billingStreet" placeholder="str. Industrială 24" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={labels.city} error={errors.billingCity}>
              <Input name="billingCity" placeholder="Chișinău" required />
            </Field>
            <Field label={labels.district}>
              <Input name="billingDistrict" placeholder="Botanica / Cluj" />
            </Field>
          </div>
          <Field label={labels.postal}>
            <Input name="billingPostal" placeholder="MD-2044" />
          </Field>

          {/* Shipping section */}
          <SectionTitle>{labels.sectionShipping}</SectionTitle>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={shippingSame}
              onChange={(e) => setShippingSame(e.target.checked)}
              className="size-4 accent-primary"
            />
            <span>{labels.shippingSameAsBilling}</span>
          </label>
          {!shippingSame ? (
            <>
              <Field label={labels.country}>
                <select
                  name="shippingCountry"
                  defaultValue="MD"
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.labelRo}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={labels.street}>
                <Input name="shippingStreet" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={labels.city}>
                  <Input name="shippingCity" />
                </Field>
                <Field label={labels.district}>
                  <Input name="shippingDistrict" />
                </Field>
              </div>
              <Field label={labels.postal}>
                <Input name="shippingPostal" />
              </Field>
            </>
          ) : null}

          {/* Fiscal section */}
          <SectionTitle>{labels.sectionFiscal}</SectionTitle>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={vatPayer}
              onChange={(e) => setVatPayer(e.target.checked)}
              className="size-4 accent-primary"
            />
            <span>{labels.vatPayer}</span>
          </label>
          {vatPayer ? (
            <Field label={labels.vatNumber} error={errors.vatNumber}>
              <Input name="vatNumber" placeholder="MD..." required />
            </Field>
          ) : null}
          <Field label={labels.euVatId} hint={labels.euVatIdHint}>
            <Input name="euVatId" placeholder="RO12345678 / DE..." />
          </Field>
        </>
      ) : null}

      {/* Password */}
      <Field label={labels.password} error={errors.password}>
        <div className="relative">
          <Input
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            tabIndex={-1}
            aria-label="toggle password"
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>
      <Field label={labels.passwordConfirm} error={errors.passwordConfirm}>
        <Input
          name="passwordConfirm"
          type={showPw ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-strong">
        <input
          type="checkbox"
          name="terms"
          required
          className="mt-0.5 size-4 accent-primary"
        />
        <span>
          {labels.termsAccept}
          {errors.terms ? <span className="ml-1 text-destructive">*</span> : null}
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-strong">
        <input type="checkbox" name="marketing" className="mt-0.5 size-4 accent-primary" />
        <span>{labels.marketingAccept}</span>
      </label>

      {errors.root ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {errors.root}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-2" disabled={pending}>
        {pending ? "…" : labels.submit}
      </Button>

      <p className="text-center text-xs text-muted">
        {labels.haveAccount}{" "}
        <Link href="/login" locale={locale} className="font-semibold text-primary hover:underline">
          {labels.loginNow}
        </Link>
      </p>
    </form>
  );
}

function TabBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-strong hover:bg-background/40",
      )}
    >
      {label}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
      {children}
    </h3>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">
        {label} {error ? <span className="text-destructive">{error}</span> : null}
      </span>
      {children}
      {hint && !error ? (
        <span className="text-[10px] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
