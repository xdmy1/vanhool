-- Track when a purchase was emailed to the bookkeeper. Null while it's
-- still pending, non-null timestamp marks the row as already forwarded so
-- the "Contabilului" button can flip from green to yellow ("sent — click
-- to re-send") instead of staying green forever.
--
-- Mirrors the same column added to `invoices` earlier; idempotent.

alter table public.purchases
  add column if not exists accountant_sent_at timestamptz;
