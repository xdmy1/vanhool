import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterChips } from "@/components/admin/FilterChips";
import { MessageCard } from "@/components/admin/messages/MessageCard";
import { adminListMessages } from "@/lib/admin/queries";

const STATUS_VALUES = ["all", "new", "reading", "replied", "archived"] as const;
type StatusFilter = (typeof STATUS_VALUES)[number];

export default async function AdminMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const status: StatusFilter = STATUS_VALUES.includes(sp.status as StatusFilter)
    ? (sp.status as StatusFilter)
    : "all";

  const [t, messages] = await Promise.all([
    getTranslations("admin"),
    adminListMessages(status),
  ]);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("nav_messages")}
        title={t("messages_title")}
        subtitle={`${messages.length} · ${messages.length === 1 ? "1 message" : `${messages.length} messages`}`}
      />

      <div className="mt-6">
        <FilterChips
          paramName="status"
          options={[
            { value: "all", label: t("messages_filter_all") },
            { value: "new", label: t("messages_filter_new") },
            { value: "reading", label: t("messages_filter_reading") },
            { value: "replied", label: t("messages_filter_replied") },
            { value: "archived", label: t("messages_filter_archived") },
          ]}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-border bg-surface px-6 py-16 text-sm text-muted">
            {t("messages_empty")}
          </div>
        ) : (
          messages.map((m) => (
            <MessageCard
              key={m.id}
              message={m}
              locale={locale}
              labels={{
                status_new: t("message_status_new"),
                status_reading: t("message_status_reading"),
                status_replied: t("message_status_replied"),
                status_archived: t("message_status_archived"),
                topic: t("message_topic"),
                reply_email: t("message_action_reply_email"),
                mark_read: t("message_action_mark_read"),
                mark_replied: t("message_action_mark_replied"),
                archive: t("message_action_archive"),
                reopen: t("message_action_reopen"),
                error: t("common_error"),
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
