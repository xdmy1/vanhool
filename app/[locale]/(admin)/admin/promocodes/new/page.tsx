import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PromoForm } from "@/components/admin/promocodes/PromoForm";

export default async function NewPromoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        title={t("promocodes_new")}
        back={{ href: "/admin/promocodes", label: t("nav_promocodes"), locale }}
      />
      <div className="mt-6">
        <PromoForm
          locale={locale}
          labels={{
            code: t("field_code"),
            discount_type: t("field_discount_type"),
            type_percentage: t("field_discount_type_percentage"),
            type_fixed: t("field_discount_type_fixed"),
            discount_value: t("field_discount_value"),
            min_order: t("field_min_order"),
            max_uses: t("field_max_uses"),
            active: t("field_active"),
            save: t("common_save"),
            saving: t("common_saving"),
            create: t("common_create"),
            creating: t("common_creating"),
            delete: t("common_delete"),
            confirm_delete: t("confirm_delete"),
            cancel: t("common_cancel"),
            required: t("common_required"),
            error_generic: t("common_error"),
          }}
        />
      </div>
    </div>
  );
}
