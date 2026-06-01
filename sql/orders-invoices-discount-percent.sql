-- Add an optional commercial discount that the operator can apply at
-- checkout — surfaces in /panel/vanzare-noua and /panel/proforme/new.
--
-- Convention: the percent is taken off the GROSS (subtotal + vat_amount).
-- We don't recompute subtotal / vat_amount fields when a discount is
-- applied so the line-by-line VAT breakdown stays auditable on the
-- printed document. `total` stores the post-discount gross — i.e. what
-- the customer actually owes.
--
-- discount_percent is bounded 0..100. NULL or 0 = no discount (default).
-- Idempotent.

alter table public.orders
  add column if not exists discount_percent numeric(5,2)
    check (discount_percent is null or (discount_percent >= 0 and discount_percent <= 100));

alter table public.invoices
  add column if not exists discount_percent numeric(5,2)
    check (discount_percent is null or (discount_percent >= 0 and discount_percent <= 100));
