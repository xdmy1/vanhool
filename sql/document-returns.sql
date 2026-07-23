-- ============================================================================
-- Returns / credit-note annexes for invoices AND purchases
-- ----------------------------------------------------------------------------
-- A "return" is a negative annex permanently attached to its parent document:
--   • parent_type='invoice'  — customer brought a line back. Annex shows -amount
--     on the factură; travels WITH the invoice to the accountant. Restocks +qty.
--   • parent_type='purchase' — we send a line back to the supplier. Annex shows
--     -cost on the achiziție; travels WITH the purchase to the accountant.
--     De-stocks -qty.
--
-- The original document is never mutated — the annex is a linked credit record,
-- so a paid invoice / posted purchase keeps its issued figures and the net
-- position (parent + annexes) is what the accountant reconciles.
--
-- Amounts are stored as POSITIVE magnitudes; every display/email renders them
-- as negative. Idempotent — safe to paste into Supabase Studio more than once.
-- ============================================================================

create table if not exists public.document_returns (
  id             uuid primary key default gen_random_uuid(),
  parent_type    text not null check (parent_type in ('invoice','purchase')),
  parent_id      uuid not null,
  -- invoice: index of the line in items_snapshot; purchase: purchase_items.id.
  line_ref       text,
  product_id     uuid references public.products(id) on delete set null,
  part_code      text,
  name           text,
  quantity       numeric(12,3) not null,
  -- gross per unit (invoice: price paid; purchase: cost paid at supplier).
  unit_amount    numeric(12,2) not null,
  vat_rate       numeric(5,2) not null default 0,
  net_amount     numeric(12,2) not null default 0,
  vat_amount     numeric(12,2) not null default 0,
  -- gross magnitude of the return (positive; rendered as negative).
  total          numeric(12,2) not null default 0,
  currency       text not null default 'MDL',
  account_scope  text,
  reason         text,
  -- true once stock has been adjusted for this return (so undo can reverse it).
  stock_adjusted boolean not null default false,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now()
);

create index if not exists document_returns_parent_idx
  on public.document_returns (parent_type, parent_id);
create index if not exists document_returns_created_idx
  on public.document_returns (created_at desc);

-- Reached through the panel's authenticated session / service role. RLS on with
-- no public policy keeps the browser anon key out.
alter table public.document_returns enable row level security;
