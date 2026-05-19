-- =============================================================================
-- Track when, how much, and in what currency a fiscal invoice was paid.
-- Lets deferred-payment invoices be reconciled later without losing the
-- snapshot of what actually came in (e.g. customer paid in EUR for a MDL
-- invoice). All columns are nullable — only filled when the invoice is
-- actually marked paid. Idempotent.
-- =============================================================================

alter table public.invoices
  add column if not exists paid_amount numeric(12, 2),
  add column if not exists paid_currency text,
  add column if not exists paid_method text
    check (paid_method is null or paid_method in ('cash', 'transfer', 'card', 'other'));
