import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getCreditById } from "@/lib/panel/credits/queries";
import { getCompanyAndBank } from "@/lib/panel/settings/company";
import { PrintVoucherButton } from "@/components/dashboard/PrintVoucherButton";
import { TIMEZONE } from "@/lib/datetime";

/**
 * Printable store-credit voucher. Accessible to the credit's owner or an admin.
 * Save-as-PDF from the browser (window.print). One credit = one voucher.
 */
export default async function CreditVoucherPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?next=/${locale}/dashboard/credit/${id}`);

  const credit = await getCreditById(id);
  if (!credit) notFound();

  // Access: the owner, or an admin.
  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = Boolean((me as { is_admin?: boolean } | null)?.is_admin);
  if (credit.client_id !== user.id && !isAdmin) notFound();

  const { data: owner } = await supabase
    .from("profiles")
    .select("full_name, company_name, email")
    .eq("id", credit.client_id)
    .maybeSingle();
  const ownerName =
    (owner as { company_name?: string | null; full_name?: string | null; email?: string | null } | null)
      ?.company_name ||
    (owner as { full_name?: string | null } | null)?.full_name ||
    (owner as { email?: string | null } | null)?.email ||
    "Client";

  const { company } = await getCompanyAndBank();
  const available = Number((credit.amount - credit.used_amount).toFixed(2));
  const issued = new Date(credit.created_at).toLocaleDateString("ro-RO", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 print:py-0">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintVoucherButton />
      </div>

      <div className="rounded-lg border-2 border-foreground/80 bg-white p-8 text-[#1a1a1a] print:border-black">
        <div className="flex items-start justify-between border-b border-black/20 pb-4">
          <div>
            <div className="text-lg font-bold">{company.legal_name}</div>
            <div className="mt-1 text-xs text-black/60">{company.address}</div>
            <div className="text-xs text-black/60">IDNO: {company.idno}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-black/50">
              Bon valoric / Credit
            </div>
            <div className="mt-1 font-mono text-lg font-bold">{credit.serial ?? "—"}</div>
          </div>
        </div>

        <div className="py-8 text-center">
          <div className="text-xs uppercase tracking-wider text-black/50">
            Credit disponibil
          </div>
          <div className="mt-2 text-5xl font-extrabold tracking-tight">
            {available.toFixed(2)} {credit.currency}
          </div>
          {credit.status !== "active" ? (
            <div className="mt-2 inline-block rounded bg-red-100 px-3 py-1 text-xs font-semibold uppercase text-red-700">
              {credit.status === "used" ? "Folosit" : "Anulat"}
            </div>
          ) : (
            <div className="mt-3 text-sm text-black/70">
              Valabil pentru următoarea comandă
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-black/20 pt-4 text-sm">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-black/50">Beneficiar</div>
            <div className="font-medium">{ownerName}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-black/50">Emis</div>
            <div className="font-medium">{issued}</div>
          </div>
          {credit.reason ? (
            <div className="col-span-2">
              <div className="text-[11px] uppercase tracking-wide text-black/50">Motiv</div>
              <div>{credit.reason}</div>
            </div>
          ) : null}
          <div className="col-span-2">
            <div className="text-[11px] uppercase tracking-wide text-black/50">Valoare emisă</div>
            <div>
              {credit.amount.toFixed(2)} {credit.currency}
              {credit.used_amount > 0 ? (
                <span className="text-black/50">
                  {" "}
                  · folosit {credit.used_amount.toFixed(2)} {credit.currency}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-black/20 pt-3 text-[10px] leading-relaxed text-black/50">
          Prezentați acest bon la următoarea comandă pentru a beneficia de credit.
          Creditul este exprimat în {credit.currency} și nu se convertește în altă
          valută. Cod document: {credit.id}
        </div>
      </div>
    </div>
  );
}
