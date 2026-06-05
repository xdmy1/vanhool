-- Opt-in catalog flag for purchase lines.
--
-- Before this change, `postPurchase` auto-created a product for every
-- line that didn't already have one — useful for re-stockable parts the
-- shop sells routinely, noisy for one-off bits the operator never wants
-- public. The checkbox on the purchase form drives this column; the
-- post-purchase loop now only creates / increments stock for lines where
-- it's true.
--
-- Idempotent.

alter table public.purchase_items
  add column if not exists add_to_catalog boolean not null default false;
