-- ============================================================================
-- Facturi de retur — numbered return documents on top of document_returns
-- ----------------------------------------------------------------------------
-- Every return annex line now belongs to a numbered "factură de retur"
-- (RET-0001, RET-0002 …) listed under /panel/retururi. Lines returned from the
-- SAME document on the SAME day (and not yet sent to the accountant) share one
-- number — three «Retur» clicks on one purchase = one return invoice.
--
-- The return invoice is sent to the bookkeeper on its own (the parent document
-- may already have been sent + entered), so it carries its own sent / entered
-- stamps, same chain as invoices and purchases:
--   (netrimis) → accountant_sent_at → accountant_entered_at
--
-- Requires sql/document-returns.sql. Idempotent — safe to paste into Supabase
-- Studio more than once.
-- ============================================================================

create sequence if not exists public.document_return_number_seq;

alter table public.document_returns
  add column if not exists return_number bigint;
alter table public.document_returns
  add column if not exists accountant_sent_at timestamptz;
alter table public.document_returns
  add column if not exists accountant_entered_at timestamptz;

-- Backfill: existing annex lines get one number per (document, Chișinău day),
-- in chronological order, continuing after any number already allocated.
with groups as (
  select
    parent_type,
    parent_id,
    (created_at at time zone 'Europe/Chisinau')::date as ret_day,
    min(created_at) as first_at
  from public.document_returns
  where return_number is null
  group by 1, 2, 3
),
numbered as (
  select
    g.*,
    (select coalesce(max(return_number), 0) from public.document_returns)
      + row_number() over (order by g.first_at) as n
  from groups g
)
update public.document_returns r
set return_number = n.n
from numbered n
where r.return_number is null
  and r.parent_type = n.parent_type
  and r.parent_id = n.parent_id
  and (r.created_at at time zone 'Europe/Chisinau')::date = n.ret_day;

-- Move the sequence past the highest number in use. Never moves it backwards,
-- so re-running after a return was deleted doesn't hand its number out again.
do $$
declare
  m bigint;
  lv bigint;
  called boolean;
begin
  select coalesce(max(return_number), 0) into m from public.document_returns;
  select last_value, is_called into lv, called
    from public.document_return_number_seq;
  if m > 0 and (not called or lv < m) then
    perform setval('public.document_return_number_seq', m, true);
  end if;
end $$;

-- New lines take the next number on their own; the panel passes an explicit
-- number only when the line joins an open return invoice.
alter table public.document_returns
  alter column return_number set default nextval('public.document_return_number_seq');

create index if not exists document_returns_number_idx
  on public.document_returns (return_number);
