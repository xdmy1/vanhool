-- Fix the two 2026-06-01 panel sales whose currency was saved as MDL
-- even though the operator intended EUR. Numeric amounts stay the
-- same — the operator confirmed the figures (1850 / 1550) are the
-- EUR amounts. Only the currency label is wrong.
--
-- Orders affected:
--   b62dc6fc-42df-4315-976a-780c08eb9573  VANELIK TRUKS         1850 → EUR
--   0d5709d3-feab-43a3-ae3f-0707cd26b050  GLOBAL TOUR EXPRESS   1550 → EUR
--
-- Update both the order row and the mirrored invoice so /panel/facturi
-- and the dashboard pick up EUR on the next refresh.

update public.orders
set currency = 'EUR', updated_at = now()
where id in (
  'b62dc6fc-42df-4315-976a-780c08eb9573',
  '0d5709d3-feab-43a3-ae3f-0707cd26b050'
);

update public.invoices
set currency = 'EUR', updated_at = now()
where order_id in (
  'b62dc6fc-42df-4315-976a-780c08eb9573',
  '0d5709d3-feab-43a3-ae3f-0707cd26b050'
);
