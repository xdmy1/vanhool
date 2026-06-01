-- Allow the storefront (anon role) to SELECT every category, including those
-- with `is_active=false`.
--
-- Why this is needed
-- ------------------
-- A category can be soft-archived (is_active=false) while its children remain
-- active and hold live products. The storefront builds a TREE from this table
-- to render the filter sidebar and product-detail breadcrumbs; if the parent
-- isn't returned, its active children orphan-promote to roots, the breadcrumb
-- loses the "Catalog > <Root> > <Subcategory>" middle slot, and the filter
-- sidebar shows a flat scatter of subcategory names ("Filtru de ulei",
-- "Filtru de aer", "lumini pentru plăcuța de înmat", ...) instead of grouping
-- them under "Filtre" / "Iluminat".
--
-- is_active on a category is editorial (does this label belong in the
-- homepage tile grid?), not access-controlled. The PRODUCTS table already
-- gates visibility via its own is_active flag, so widening category reads
-- doesn't expose anything sensitive.
--
-- Idempotent: drop any pre-existing SELECT policy on categories, then create
-- one that allows public reads unconditionally.

alter table public.categories enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.categories', pol.policyname);
  end loop;
end $$;

create policy "categories_public_read_all"
  on public.categories
  for select
  to public
  using (true);
