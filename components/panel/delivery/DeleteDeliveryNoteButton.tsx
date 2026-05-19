"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { deleteDeliveryNote } from "@/lib/panel/delivery_notes/actions";

export function DeleteDeliveryNoteButton({
  noteId,
  locale,
}: {
  noteId: string;
  locale: string;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, start] = useTransition();

  function onClick() {
    if (!window.confirm(t("delivery_delete_confirm"))) return;
    start(async () => {
      const res = await deleteDeliveryNote(noteId);
      if (res.ok) {
        toast.success(t("delivery_delete_success"));
        router.push(`/${locale}/panel/fisa-de-livrare`);
      } else {
        toast.error(t("delivery_delete_error", { reason: res.reason }));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      className="gap-1.5"
      onClick={onClick}
      disabled={pending}
    >
      <Trash2 className="size-4" />
      {pending ? t("delivery_delete_pending") : t("action_delete")}
    </Button>
  );
}
