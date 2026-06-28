-- Backfill: historical conta1 fiscal invoices stored subtotal = GROSS and
-- vat_amount = 0 (the pre-unification sale-mirror / triage / order-backfill
-- paths). The unified panel convention is:
--     subtotal   = NET   (gross / 1.2 on conta1)
--     vat_amount = 20% TVA extracted from the gross
--     total      = GROSS (= net + vat)
--
-- The monthly accountant fiscal report and the single-document accountant
-- email both read invoices.subtotal / vat_amount verbatim, so until these rows
-- are corrected every past conta1 invoice reports "Subtotal net" = the gross
-- figure and "TVA" = 0, understating the booked VAT.
--
-- IDEMPOTENT: the `vat_amount = 0` guard means a re-run skips rows already
-- fixed (after the update they carry vat_amount > 0). Recomputes from `total`
-- (always GROSS), so it is correct regardless of what `subtotal` currently
-- holds. Run in the Supabase Studio SQL editor.
--
-- NOTE: this fixes the BOOKED totals (the money-relevant part the accountant
-- reports use). It does NOT rewrite the per-line items_snapshot.vat_rate of old
-- rows, so re-printing a pre-fix invoice on screen may still show 0% in the
-- per-line TVA column while the footer (from the corrected stored totals) is
-- right. New invoices write vat_rate = 20 per line and are fully consistent.

-- Preview the rows that WILL be touched (run this first to sanity-check):
--   select id, series, number, account_scope, total, subtotal, vat_amount
--   from public.invoices
--   where (type = 'invoice' or type is null)
--     and account_scope = 'conta1'
--     and coalesce(vat_amount, 0) = 0
--     and coalesce(total, 0) > 0;

update public.invoices
set
  subtotal   = round(total / 1.2, 2),
  vat_amount = round(total - round(total / 1.2, 2), 2)
where (type = 'invoice' or type is null)
  and account_scope = 'conta1'
  and coalesce(vat_amount, 0) = 0
  and coalesce(total, 0) > 0;

-- Verify reconciliation afterwards (expect zero rows):
--   select id, series, number, subtotal, vat_amount, total,
--          round(subtotal + vat_amount, 2) as recomputed
--   from public.invoices
--   where (type = 'invoice' or type is null)
--     and account_scope = 'conta1'
--     and round(subtotal + vat_amount, 2) <> round(total, 2);
