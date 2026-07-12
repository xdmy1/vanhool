-- Internal-only products: stock-tracked, never listed in the catalog.
--
-- Context: postPurchase used to skip creating a product for any purchase line
-- whose `add_to_catalog` was unticked. Those goods entered the warehouse but
-- never entered `products.stock_quantity`, so an invoice had nothing to take
-- back out. Now EVERY posted line gets a product row and moves stock, and this
-- flag is what keeps the unticked ones out of the admin product catalog.
--
--   internal_only = true   -> stock + sale/proforma/invoice only. Hidden from
--                             /admin/products (except the "Interne" filter).
--                             Already invisible on the storefront via is_active.
--   internal_only = false  -> a normal catalog product (the default).
--
-- Idempotent: safe to run more than once.

alter table public.products
  add column if not exists internal_only boolean not null default false;

comment on column public.products.internal_only is
  'True for products auto-created by postPurchase when add_to_catalog was unticked: tracked for stock, hidden from the admin catalog list.';

-- The admin list filters on this on every page load; keep it cheap. Partial
-- index because the overwhelming majority of rows are false.
create index if not exists products_internal_only_idx
  on public.products (internal_only)
  where internal_only = true;

-- NOTE: no backfill. Existing products stay internal_only = false (catalog
-- items), which is what they were. The 115 already-posted purchase lines that
-- never entered stock are deliberately left alone — postPurchase is idempotent
-- on status='posted' and will not retro-stock them.
