-- ============================================================================
-- Store credit (credit client) — issued when a site order can't be refunded in
-- cash. The customer gets a PDF voucher for the amount, usable on a next order.
-- ----------------------------------------------------------------------------
-- Balances are NEVER summed across currencies — each credit keeps its own
-- currency and is displayed per-currency (owner instruction: nu amesteca
-- lei/eur). available = amount − used_amount while status = 'active'.
--
-- Idempotent — safe to paste into Supabase Studio's SQL editor more than once.
-- ============================================================================

create table if not exists public.store_credits (
  id           uuid primary key default gen_random_uuid(),
  -- The customer this credit belongs to (profiles.id / auth user id).
  client_id    uuid not null references public.profiles(id) on delete cascade,
  -- Human-facing voucher number, e.g. "CR-0001".
  serial       text unique,
  amount       numeric(12,2) not null check (amount > 0),
  used_amount  numeric(12,2) not null default 0,
  currency     text not null default 'MDL',
  reason       text,
  -- Optional link to the site order this credit compensates.
  order_id     uuid references public.orders(id) on delete set null,
  status       text not null default 'active' check (status in ('active','used','void')),
  issued_by    uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists store_credits_client_idx on public.store_credits (client_id);
create index if not exists store_credits_status_idx on public.store_credits (status);

-- The customer must be able to READ their own credits (dashboard + nav); nobody
-- can write from the browser (issuing/voiding happens through the panel via the
-- service-role / authenticated admin path).
alter table public.store_credits enable row level security;

do $$ begin
  create policy store_credits_owner_read on public.store_credits
    for select using (auth.uid() = client_id);
exception when duplicate_object then null; end $$;
