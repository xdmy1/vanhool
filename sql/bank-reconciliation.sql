-- ============================================================================
-- Bank statement reconciliation: applied-payment log + double-import guard
-- ----------------------------------------------------------------------------
-- The panel imports a Moldovan "Extras" bank statement (XML), matches each
-- INCOMING transfer to a client by fiscal code, and — after the operator
-- confirms — marks that client's open invoices paid/partial.
--
-- This table records every APPLIED bank transaction so the same statement can
-- be re-imported without double-paying: `bank_reference` is unique, and the
-- preview marks already-logged references as "deja reconciliat". It doubles as
-- an audit trail (who applied what, and which invoices it covered).
--
-- Idempotent — safe to paste into Supabase Studio's SQL editor more than once.
-- ============================================================================

create table if not exists public.bank_payments (
  id                  uuid primary key default gen_random_uuid(),
  -- Bank's own unique transaction reference (e.g. "FT262020175571").
  bank_reference      text not null unique,
  statement_account   text,
  tx_date             date,
  amount              numeric(12,2) not null,
  currency            text not null default 'MDL',
  counterparty_name   text,
  counterparty_fiscal text,
  -- [{ invoice_id, series, number, amount }] — what this payment settled.
  allocations         jsonb not null default '[]'::jsonb,
  applied_by          uuid references auth.users(id) on delete set null,
  applied_at          timestamptz not null default now()
);

create index if not exists bank_payments_fiscal_idx on public.bank_payments (counterparty_fiscal);
create index if not exists bank_payments_date_idx   on public.bank_payments (tx_date desc);

-- Server-only store (reached via the panel's authenticated session / service
-- role). Enable RLS with no public policy so the browser anon key can't read it.
alter table public.bank_payments enable row level security;
