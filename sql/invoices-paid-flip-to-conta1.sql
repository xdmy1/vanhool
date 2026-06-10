-- Backfill: every paid invoice (proforma or fiscal) belongs in the
-- official book. The action layer now flips account_scope to conta1 on
-- mark-paid / paid-conversion / paid-direct-sale, but historical rows
-- still sit on conta2 because they were paid before the flip landed.
--
-- This moves them to conta1 so /panel/facturi (Conta 1 tab) shows every
-- paid document together — matching the operator's expectation that
-- "factura plătită = oficială".
--
-- The originating orders, cash_register_movements, and proforma rows are
-- intentionally untouched: the cash actually hit conta2 and we still want
-- to see that in the cash drawer history and conta2 sales reports.
-- Only the INVOICE document moves; the SALE record stays put.
--
-- Idempotent — re-running it is a no-op once everything is on conta1.

update public.invoices
   set account_scope = 'conta1'
 where status = 'paid'
   and account_scope = 'conta2';
