-- Allow the invoices.status CHECK to accept 'partial'.
--
-- Partial payments: marking a 1200 EUR invoice paid with 600 EUR now leaves it
-- status='partial' (running paid_amount, balance still due) until the total is
-- covered. The original CHECK constraint only permitted
-- draft/issued/sent/paid/void/converted, so the app's UPDATE was rejected with
-- 23514 "invoices_status_check". This widens it to include 'partial'.
--
-- Idempotent: drop-if-exists + add. Run in the Supabase Studio SQL editor.
-- MUST run before the partial-payment feature works on the live site.

alter table public.invoices drop constraint if exists invoices_status_check;
alter table public.invoices
  add constraint invoices_status_check
  check (status in ('draft','issued','sent','partial','paid','void','converted'));

-- Optional one-off: re-classify invoices that were marked fully paid but only
-- received a partial amount (recorded before this feature existed). Safe to run
-- once; afterwards there should be no paid rows with paid_amount < total.
update public.invoices
set status = 'partial', paid_at = null
where type = 'invoice'
  and status = 'paid'
  and paid_amount is not null
  and paid_amount < total - 0.01;
