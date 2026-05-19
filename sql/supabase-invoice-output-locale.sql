-- =============================================================================
-- Add a per-document output language to invoices/proformas. When set, the
-- printable view uses this locale for all labels/dates regardless of the
-- admin's current UI language. Defaults to 'ro' so existing rows keep their
-- current behaviour.
-- =============================================================================

alter table public.invoices
  add column if not exists output_locale text not null default 'ro'
    check (output_locale in ('ro', 'en', 'ru'));
