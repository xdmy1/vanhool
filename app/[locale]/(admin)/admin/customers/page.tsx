import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { CustomersTable } from "@/components/admin/customers/CustomersTable";
import { adminListCustomers } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCustomersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const [t, customers] = await Promise.all([
    getTranslations("admin"),
    adminListCustomers(sp.q),
  ]);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("nav_customers")}
        title={t("customers_title")}
        subtitle={`${customers.length} · ${customers.length === 1 ? "1 customer" : `${customers.length} customers`}`}
      />

      <div className="mt-6">
        <SearchInput
          placeholder={t("customers_search_placeholder")}
          className="md:max-w-md"
        />
      </div>

      <div className="mt-6">
        <CustomersTable
          rows={customers}
          currentUserId={user.id}
          locale={locale}
          labels={{
            empty: t("customers_empty"),
            name: t("customers_col_name"),
            email: t("customers_col_email"),
            phone: t("customers_col_phone"),
            orders: t("customers_col_orders"),
            spent: t("customers_col_spent"),
            role: t("customers_col_role"),
            role_admin: t("customers_role_admin"),
            role_customer: t("customers_role_customer"),
            discount: t("customers_col_discount"),
            discount_save: t("customers_action_discount_save"),
            discount_clear: t("customers_action_discount_clear"),
          }}
        />
      </div>
    </div>
  );
}
