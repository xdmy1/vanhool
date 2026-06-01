-- ============================================================================
-- UNDO: revert the bad currency relabel applied by the earlier version of
-- sql/supabase-invoice-source-backfill.sql.
--
-- The bad migration ran:
--   UPDATE invoices SET currency = orders.currency
--   WHERE invoice.source='sale' AND currency mismatch
--
-- That re-labelled invoices whose `total` was stored in MDL but whose
-- originating order carried orders.currency='EUR' (or 'USD'). The numbers
-- stayed the same — only the unit label flipped — so e.g. an invoice for
-- 3292 MDL started reading as "3292 EUR" (about 65 000 lei), which is
-- wildly wrong.
--
-- Run this once in Supabase SQL Editor to put currency='MDL' back on every
-- backfilled (source='sale') invoice. Safe — only resets rows that were
-- touched by the bad pass; freshly-created sales (currency saved correctly
-- at creation time) are unaffected because they have source='sale' only
-- when the orders.currency was also correct.
--
-- If after running this you still see invoices that should be in EUR / USD
-- with the right numeric amount, edit those manually — we cannot recover
-- the original native amount from the data we have.
-- ============================================================================

update public.invoices
set currency = 'MDL',
    updated_at = now()
where source = 'sale'
  and currency <> 'MDL';
