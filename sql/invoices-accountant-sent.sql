-- Track when an invoice / proforma was emailed to the bookkeeper. Null
-- means it hasn't been sent; a non-null timestamp marks the row as already
-- forwarded so the "Send to accountant" button can flip to a "sent — click
-- to resend" yellow state instead of staying green.
--
-- Idempotent.

alter table public.invoices
  add column if not exists accountant_sent_at timestamptz;
