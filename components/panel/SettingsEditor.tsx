"use client";

import { useMemo, useState, useTransition } from "react";
import { Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatInternalCode } from "@/lib/panel/codes/format";
import { generateInternalCode } from "@/lib/panel/codes/generator";
import {
  type PanelSettings,
  type UpdatePanelSettingsInput,
  updatePanelSettings,
} from "@/lib/panel/settings/actions";

const SAMPLE_CATEGORY = "frana";

export function SettingsEditor({ initial }: { initial: PanelSettings }) {
  const t = useTranslations("panel");
  const [state, setState] = useState<PanelSettings>(initial);
  const [savePending, startSave] = useTransition();
  const [genPending, startGen] = useTransition();
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  function setField<K extends keyof PanelSettings>(key: K, value: PanelSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  const preview = useMemo(
    () =>
      formatInternalCode(
        state.internalCodeTemplate,
        state.internalCodeSequence + 1,
        state.internalCodeLetter,
        SAMPLE_CATEGORY,
      ),
    [state.internalCodeTemplate, state.internalCodeSequence, state.internalCodeLetter],
  );

  function save(fields: UpdatePanelSettingsInput) {
    startSave(async () => {
      const res = await updatePanelSettings(fields);
      if (res.ok) {
        toast.success(t("settings_saved"));
      } else {
        toast.error(t("settings_save_error", { reason: res.reason }));
      }
    });
  }

  function generateTest() {
    startGen(async () => {
      const res = await generateInternalCode({ categorySlug: SAMPLE_CATEGORY });
      if (res.ok) {
        setLastGenerated(res.code);
        setField("internalCodeSequence", res.seq);
        setField("internalCodeLetter", res.letter);
        toast.success(t("settings_generated_toast", { code: res.code }));
      } else {
        toast.error(t("settings_generate_error", { reason: res.reason }));
      }
    });
  }

  return (
    <div className="space-y-8">
      <Section title={t("settings_section_code")} body={t("settings_section_code_body")}>
        <Field label={t("settings_template_label")}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              value={state.internalCodeTemplate}
              onChange={(e) => setField("internalCodeTemplate", e.target.value)}
              placeholder="{seq:7}{letter}"
              className="md:max-w-xs"
            />
            <div className="text-xs text-muted">
              {t("settings_template_placeholders")}{" "}
              <code className="rounded bg-surface px-1 py-0.5">{"{seq:7}"}</code>{" "}
              <code className="rounded bg-surface px-1 py-0.5">{"{letter}"}</code>{" "}
              <code className="rounded bg-surface px-1 py-0.5">{"{category}"}</code>
            </div>
          </div>
        </Field>

        <Field label={t("settings_next_code_label")}>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-primary/10 px-3 py-1.5 font-mono text-base tracking-wider text-primary">
              {preview}
            </span>
            <span className="text-xs text-muted">
              {t("settings_next_code_helper", { sample: SAMPLE_CATEGORY })}
            </span>
          </div>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("settings_sequence_label")}>
            <Input
              type="number"
              value={state.internalCodeSequence}
              onChange={(e) =>
                setField("internalCodeSequence", Number(e.target.value || 0))
              }
              min={0}
              className="md:max-w-xs"
            />
            <p className="mt-1 text-xs text-muted">
              {t("settings_sequence_helper", { next: state.internalCodeSequence + 1 })}
            </p>
          </Field>

          <Field label={t("settings_letter_label")}>
            <Input
              value={state.internalCodeLetter}
              onChange={(e) =>
                setField("internalCodeLetter", e.target.value.slice(0, 2).toUpperCase())
              }
              maxLength={2}
              className="md:max-w-xs uppercase"
            />
            <p className="mt-1 text-xs text-muted">{t("settings_letter_helper")}</p>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() =>
              save({
                internalCodeTemplate: state.internalCodeTemplate,
                internalCodeSequence: state.internalCodeSequence,
                internalCodeLetter: state.internalCodeLetter,
              })
            }
            disabled={savePending}
            className="gap-1.5"
          >
            <Save className="size-4" />
            {savePending ? t("action_saving") : t("settings_save_button")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={generateTest}
            disabled={genPending}
            className="gap-1.5"
          >
            <Wand2 className="size-4" />
            {genPending ? t("action_generating") : t("settings_test_button")}
          </Button>
          {lastGenerated ? (
            <span className="text-xs text-muted">
              {t("settings_test_consumes", { code: lastGenerated })}
            </span>
          ) : null}
        </div>
      </Section>

      <Section title={t("settings_section_numbering")} body={t("settings_section_numbering_body")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("settings_invoice_series")}>
            <Input
              value={state.invoiceSeries}
              onChange={(e) =>
                setField("invoiceSeries", e.target.value.slice(0, 6).toUpperCase())
              }
              className="md:max-w-xs"
            />
          </Field>
          <Field label={t("settings_invoice_next_number")}>
            <Input
              type="number"
              value={state.invoiceNextNumber}
              onChange={(e) =>
                setField("invoiceNextNumber", Number(e.target.value || 1))
              }
              min={1}
              className="md:max-w-xs"
            />
          </Field>
          <Field label={t("settings_delivery_series")}>
            <Input
              value={state.deliveryNoteSeries}
              onChange={(e) =>
                setField("deliveryNoteSeries", e.target.value.slice(0, 6).toUpperCase())
              }
              className="md:max-w-xs"
            />
          </Field>
          <Field label={t("settings_delivery_next_number")}>
            <Input
              type="number"
              value={state.deliveryNoteNextNumber}
              onChange={(e) =>
                setField("deliveryNoteNextNumber", Number(e.target.value || 1))
              }
              min={1}
              className="md:max-w-xs"
            />
          </Field>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={() =>
              save({
                invoiceSeries: state.invoiceSeries,
                invoiceNextNumber: state.invoiceNextNumber,
                deliveryNoteSeries: state.deliveryNoteSeries,
                deliveryNoteNextNumber: state.deliveryNoteNextNumber,
              })
            }
            disabled={savePending}
            className="gap-1.5"
          >
            <Save className="size-4" />
            {savePending ? t("action_saving") : t("settings_save_series_button")}
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-5 md:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {body ? (
          <p className="mt-1 text-sm text-muted-strong">{body}</p>
        ) : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
