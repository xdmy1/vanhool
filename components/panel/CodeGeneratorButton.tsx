"use client";

import { useState, useTransition } from "react";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { generateInternalCode } from "@/lib/panel/codes/generator";

type Props = {
  /** Receives the generated code. The component does not own the input value. */
  onGenerated: (code: string) => void;
  /** First 2 chars are used by `{category}` placeholders. */
  categorySlug?: string;
  /** Optional label override (defaults to translated "Generate internal code"). */
  label?: string;
  size?: "sm" | "md";
};

export function CodeGeneratorButton({
  onGenerated,
  categorySlug,
  label,
  size = "sm",
}: Props) {
  const t = useTranslations("panel");
  const [pending, startTransition] = useTransition();
  const [lastCode, setLastCode] = useState<string | null>(null);

  function go() {
    startTransition(async () => {
      const res = await generateInternalCode(
        categorySlug ? { categorySlug } : undefined,
      );
      if (res.ok) {
        onGenerated(res.code);
        setLastCode(res.code);
        toast.success(t("settings_generated_toast", { code: res.code }));
      } else {
        toast.error(t("settings_generate_error", { reason: res.reason }));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={go}
      disabled={pending}
      className="gap-1.5"
      title={lastCode ? `${t("settings_generated_toast", { code: lastCode })}` : undefined}
    >
      <Wand2 className="size-3.5" />
      {label ?? (pending ? t("action_generating") : t("action_generate_code"))}
    </Button>
  );
}
