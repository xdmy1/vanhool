-- ============================================================================
-- Unit of measure on purchase lines (buc / litru / metru / …)
-- ----------------------------------------------------------------------------
-- purchase_items now carry a unit, matching products.unit (added by
-- units-of-measure-migration.sql). When a purchase line is posted, postPurchase
-- writes this unit onto the product it creates, so the same unit flows through
-- to the admin catalog and the public storefront. Quantity is already
-- numeric(12,3), so divisible units (1.5 litri, 2.3 m) store cleanly.
--
-- Vocabulary lives in the app (lib/stock.ts PRODUCT_UNITS), NOT a DB CHECK, so
-- adding a unit never blocks a save. Idempotent — safe to re-run.
-- ============================================================================

alter table public.purchase_items
  add column if not exists unit text not null default 'buc';
