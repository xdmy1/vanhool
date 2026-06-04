-- Pre-orders: customer asks for a part we don't have on stock. Operator
-- contacts the supplier, agrees a final price + ETA with the customer,
-- and tracks the request here until the supplier delivers and we hand
-- the goods off.
--
-- Lifecycle:
--   pending     — operator typed it, hasn't confirmed with customer yet
--   confirmed   — customer agreed, confirmation email sent
--   ordered     — supplier order placed (link via supplier_id, optional
--                 purchase_id once a purchase row exists)
--   arrived     — supplier delivered, ready to hand off
--   delivered   — customer received it (final state)
--   cancelled   — preorder cancelled at any stage
--
-- Apply once in Supabase Studio.

create table if not exists public.preorders (
  id uuid primary key default gen_random_uuid(),

  -- Customer (either existing profile or walk-in snapshot)
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_email text,

  -- Product (existing in catalog OR free-form when supplier hasn't been
  -- registered yet)
  product_id uuid references public.products(id) on delete set null,
  part_code text,
  description text not null,
  quantity numeric not null check (quantity > 0),

  -- Supplier + cost
  supplier_id uuid references public.suppliers(id) on delete set null,
  supplier_unit_cost numeric not null default 0,

  -- Customer-facing price (cost + operator margin) and currency
  unit_price numeric not null,
  currency text not null default 'MDL',

  -- ETA the supplier promised (used to set customer expectations)
  expected_delivery_date date,

  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'ordered', 'arrived', 'delivered', 'cancelled')),

  confirmed_at timestamptz,
  confirmation_sent_at timestamptz,
  arrived_at timestamptz,
  delivered_at timestamptz,

  notes text,

  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists preorders_status_idx on public.preorders (status);
create index if not exists preorders_customer_id_idx on public.preorders (customer_id);
create index if not exists preorders_created_at_idx on public.preorders (created_at desc);
create index if not exists preorders_expected_date_idx on public.preorders (expected_delivery_date);

alter table public.preorders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'preorders' and policyname = 'preorders_admin_all'
  ) then
    create policy "preorders_admin_all"
      on public.preorders
      for all
      to public
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;
