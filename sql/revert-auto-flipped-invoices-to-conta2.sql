-- Revert invoices that were AUTO-FLIPPED from conta2 to conta1.
--
-- Background: an earlier rule moved every PAID invoice to conta1 ("factura
-- plătită = oficială"), including the migration sql/invoices-paid-flip-to-conta1.sql.
-- The operator does NOT want that: an invoice created in conta2 must stay in
-- conta2 even after it's paid. The app no longer flips on payment; this undoes
-- the historical damage.
--
-- SAFE CRITERION — only touch invoices whose ORIGIN is provably conta2:
--   * the invoice sits in conta1 now, AND
--   * its originating ORDER is still conta2 (orders were never flipped), OR
--   * its originating PROFORMA is still conta2 (proformas were never flipped).
-- Genuine conta1 invoices have a conta1 order/proforma and are left untouched.
--
-- This changes ONLY account_scope (the book). It does NOT rewrite the issued
-- amounts / VAT — the document stays exactly as it went out to the customer,
-- it is merely re-counted in the correct book.
--
-- Idempotent. Run the SELECT preview FIRST and confirm the rows look right,
-- THEN run the two UPDATE statements. Run this BEFORE using the in-app book
-- editor, otherwise a deliberate manual move could be reverted.

-- ── 1. PREVIEW (read-only) — eyeball this list before updating ───────────────
select i.series, i.number, i.status, i.total, i.currency,
       i.account_scope as invoice_book,
       o.account_scope as order_book,
       p.account_scope as proforma_book
  from public.invoices i
  left join public.orders   o on o.id = i.order_id
  left join public.invoices p on p.id = i.proforma_id and p.type = 'proforma'
 where i.type = 'invoice'
   and i.account_scope = 'conta1'
   and (o.account_scope = 'conta2' or p.account_scope = 'conta2')
 order by i.number;

-- ── 2. APPLY — move the order-linked flips back to conta2 ────────────────────
update public.invoices i
   set account_scope = 'conta2',
       updated_at = now()
  from public.orders o
 where o.id = i.order_id
   and i.type = 'invoice'
   and i.account_scope = 'conta1'
   and o.account_scope = 'conta2';

-- ── 3. APPLY — move the proforma-linked flips back to conta2 ─────────────────
--    (covers ad-hoc invoices that have no order but came from a conta2 proforma)
update public.invoices i
   set account_scope = 'conta2',
       updated_at = now()
  from public.invoices p
 where p.id = i.proforma_id
   and p.type = 'proforma'
   and i.type = 'invoice'
   and i.account_scope = 'conta1'
   and p.account_scope = 'conta2';
