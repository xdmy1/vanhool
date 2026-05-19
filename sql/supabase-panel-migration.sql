-- ============================================================================
-- Panel migration — DDL for the /panel bookkeeping/operations workspace.
--
-- Adds:
--   • `account_scope` enum (conta1 / conta2) — book scope on all transactional
--     rows. Default 'conta1' so existing orders backfill cleanly.
--   • Coloane noi pe `orders` (account_scope, source, delivery_note_id) și
--     `products` (supplier_code, supplier_id).
--   • Tabele noi: suppliers, purchases, purchase_items, invoices, expenses,
--     delivery_notes, cash_register_movements, panel_settings.
--   • RLS admin-only pe toate tabelele noi (folosește public.is_admin()).
--   • Seed-uri în `panel_settings` pentru codul intern, serii facturi, fișe.
--   • RPC public.next_internal_code() — incrementează atomic secvența.
--
-- IDEMPOTENT — se poate rula de mai multe ori fără efecte secundare. Folosește
-- `create ... if not exists`, `add column if not exists`, `do $$ ... exception
-- when duplicate_object` pentru enum-uri, și `on conflict do nothing` pentru
-- seed-uri.
--
-- Manual setup în Supabase Studio după rulare:
--   • Creează bucket-urile `purchase-docs` și `expense-receipts` cu RLS
--     admin-only (Storage → New bucket, privacy = Private).
--
-- ============================================================================

-- 0. Pre-requisites ----------------------------------------------------------
-- public.is_admin() trebuie să existe (vezi supabase-schema-all.sql:318).

-- 1. Enum account_scope ------------------------------------------------------
do $$ begin
  create type public.account_scope as enum ('conta1', 'conta2');
exception
  when duplicate_object then null;
end $$;

-- 2. Alter pe tabele existente ----------------------------------------------

-- orders: scope + source + delivery note backlink
alter table public.orders
  add column if not exists account_scope public.account_scope not null default 'conta1';

alter table public.orders
  add column if not exists source text not null default 'storefront';

do $$ begin
  alter table public.orders
    add constraint orders_source_check
    check (source in ('storefront','panel','import'));
exception
  when duplicate_object then null;
end $$;

alter table public.orders
  add column if not exists delivery_note_id uuid;

-- Triage flag pentru comenzile de pe site. NULL = neprocesat (apare pe pagina
-- de triere); NOT NULL = userul a confirmat în ce cont merge.
alter table public.orders
  add column if not exists triaged_at timestamptz;

create index if not exists orders_account_scope_idx on public.orders (account_scope);
create index if not exists orders_source_idx on public.orders (source);
create index if not exists orders_triage_idx
  on public.orders (source, triaged_at)
  where source = 'storefront';

-- Lărgim payment_method ca să accepte și 'already_paid' (vânzări panel cu plată
-- anterioară). Constraint-ul vechi (din supabase-setup.sql) permitea doar
-- paynet/cash/transfer. Drop & recreate ca să fie idempotent.
do $$ begin
  alter table public.orders drop constraint if exists orders_payment_method_check;
  alter table public.orders
    add constraint orders_payment_method_check
    check (payment_method in ('paynet','cash','transfer','already_paid'));
end $$;

-- products: codul furnizorului (privat) + legătura la furnizor
alter table public.products
  add column if not exists supplier_code text;

alter table public.products
  add column if not exists supplier_id uuid;

-- 3. Tabel suppliers ---------------------------------------------------------
create table if not exists public.suppliers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    idno text,
    vat_code text,
    contact_email text,
    contact_phone text,
    address text,
    notes text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create unique index if not exists suppliers_name_uq on public.suppliers (lower(name));

-- FK products → suppliers (după ce ambele tabele există)
do $$ begin
  alter table public.products
    add constraint products_supplier_fk
    foreign key (supplier_id) references public.suppliers(id) on delete set null;
exception
  when duplicate_object then null;
end $$;

-- 4. Tabel purchases (header) ------------------------------------------------
create table if not exists public.purchases (
    id uuid primary key default gen_random_uuid(),
    supplier_id uuid not null references public.suppliers(id) on delete restrict,
    account_scope public.account_scope not null default 'conta1',
    document_number text,
    document_date date not null default current_date,
    received_at timestamptz,
    currency text not null default 'MDL',
    fx_rate numeric(10,4),
    subtotal numeric(12,2) not null default 0,
    vat_amount numeric(12,2) not null default 0,
    total numeric(12,2) not null default 0,
    status text not null default 'draft',
    notes text,
    file_url text,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.purchases drop constraint if exists purchases_status_check;
do $$ begin
  alter table public.purchases
    add constraint purchases_status_check
    check (status in ('draft','ordered','received','posted','cancelled'));
exception when duplicate_object then null; end $$;

-- PO support: când trimitem comanda către furnizor (înainte ca el să factureze).
alter table public.purchases
  add column if not exists po_number text,
  add column if not exists po_issued_at timestamptz,
  add column if not exists expected_delivery_date date;

create unique index if not exists purchases_po_number_uq
  on public.purchases (po_number) where po_number is not null;

create index if not exists purchases_supplier_idx  on public.purchases (supplier_id);
create index if not exists purchases_scope_idx     on public.purchases (account_scope);
create index if not exists purchases_doc_date_idx  on public.purchases (document_date desc);
create index if not exists purchases_status_idx    on public.purchases (status);

-- 5. Tabel purchase_items (linii) --------------------------------------------
create table if not exists public.purchase_items (
    id uuid primary key default gen_random_uuid(),
    purchase_id uuid not null references public.purchases(id) on delete cascade,
    product_id uuid references public.products(id) on delete set null,
    supplier_code text,
    internal_code text,
    description text not null,
    quantity numeric(12,3) not null check (quantity > 0),
    unit_cost numeric(12,2) not null,
    vat_rate numeric(5,2) not null default 20,
    line_total numeric(12,2) not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists purchase_items_purchase_idx on public.purchase_items (purchase_id);
create index if not exists purchase_items_product_idx  on public.purchase_items (product_id);
create index if not exists purchase_items_internal_idx on public.purchase_items (internal_code);
create index if not exists purchase_items_supplier_idx on public.purchase_items (supplier_code);

-- 6. Tabel invoices (mirror pentru Refrens + serie/număr propriu) ------------
-- type='invoice' = factură fiscală (statusuri: draft / issued / paid / void)
-- type='proforma' = pro-formă (statusuri: sent / paid / converted / void).
-- O proformă plătită este "convertită" într-o factură nouă: se setează
-- proforma.converted_to_invoice_id → invoice.id și invoice.proforma_id ← proforma.id.
create table if not exists public.invoices (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references public.orders(id) on delete set null,
    account_scope public.account_scope not null default 'conta1',
    type text not null default 'invoice',
    series text,
    number text,
    issued_date date not null default current_date,
    due_date date,
    paid_at timestamptz,
    currency text not null default 'MDL',
    customer_snapshot jsonb not null default '{}'::jsonb,
    items_snapshot jsonb not null default '[]'::jsonb,
    subtotal numeric(12,2) not null default 0,
    vat_amount numeric(12,2) not null default 0,
    total numeric(12,2) not null default 0,
    refrens_invoice_id text,
    refrens_url text,
    pdf_url text,
    notes text,
    status text not null default 'issued',
    proforma_id uuid references public.invoices(id) on delete set null,
    converted_to_invoice_id uuid references public.invoices(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Idempotent: dacă tabelul există deja din migrația inițială, adaugă coloanele noi.
alter table public.invoices
  add column if not exists type text not null default 'invoice',
  add column if not exists due_date date,
  add column if not exists paid_at timestamptz,
  add column if not exists currency text not null default 'MDL',
  add column if not exists items_snapshot jsonb not null default '[]'::jsonb,
  add column if not exists notes text,
  add column if not exists proforma_id uuid,
  add column if not exists converted_to_invoice_id uuid;

do $$ begin
  alter table public.invoices
    add constraint invoices_type_check
    check (type in ('invoice','proforma'));
exception when duplicate_object then null; end $$;

alter table public.invoices drop constraint if exists invoices_status_check;
do $$ begin
  alter table public.invoices
    add constraint invoices_status_check
    check (status in ('draft','issued','sent','paid','void','converted'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.invoices
    add constraint invoices_proforma_fk
    foreign key (proforma_id) references public.invoices(id) on delete set null;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.invoices
    add constraint invoices_converted_fk
    foreign key (converted_to_invoice_id) references public.invoices(id) on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists invoices_type_idx on public.invoices (type);
create index if not exists invoices_proforma_link_idx on public.invoices (proforma_id);

-- (series, number) unique pentru numerotare secvențială oficială
create unique index if not exists invoices_series_number_uq
  on public.invoices (series, number)
  where series is not null and number is not null;

-- (order_id) unique parțial — fiecare comandă are cel mult o factură activă
create unique index if not exists invoices_order_id_uq
  on public.invoices (order_id)
  where order_id is not null;

create index if not exists invoices_issued_date_idx on public.invoices (issued_date desc);
create index if not exists invoices_scope_idx        on public.invoices (account_scope);

-- 7. Tabel expenses (cheltuieli, ambele scope-uri în același tabel) ---------
create table if not exists public.expenses (
    id uuid primary key default gen_random_uuid(),
    account_scope public.account_scope not null,
    category text not null,
    description text not null,
    amount numeric(12,2) not null check (amount >= 0),
    currency text not null default 'MDL',
    paid_at date not null default current_date,
    payment_method text,
    supplier_id uuid references public.suppliers(id) on delete set null,
    attached_invoice_id uuid references public.invoices(id) on delete set null,
    receipt_url text,
    notes text,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);

do $$ begin
  alter table public.expenses
    add constraint expenses_payment_method_check
    check (payment_method in ('cash','transfer','card') or payment_method is null);
exception
  when duplicate_object then null;
end $$;

create index if not exists expenses_scope_date_idx on public.expenses (account_scope, paid_at desc);
create index if not exists expenses_category_idx   on public.expenses (category);
create index if not exists expenses_supplier_idx   on public.expenses (supplier_id);

-- 8. Tabel delivery_notes (fișe de livrare) ---------------------------------
create table if not exists public.delivery_notes (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references public.orders(id) on delete set null,
    account_scope public.account_scope not null default 'conta1',
    series text,
    number text,
    issued_at timestamptz not null default now(),
    driver_name text,
    vehicle_plate text,
    customer_name text not null,
    customer_idno text,
    customer_phone text,
    delivery_address text not null,
    payment_method text,
    notes text,
    items_snapshot jsonb not null default '[]'::jsonb,
    status text not null default 'draft',
    printed_at timestamptz,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

do $$ begin
  alter table public.delivery_notes
    add constraint delivery_notes_status_check
    check (status in ('draft','dispatched','delivered','returned'));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter table public.delivery_notes
    add constraint delivery_notes_payment_check
    check (payment_method in ('cash','transfer','already_paid') or payment_method is null);
exception
  when duplicate_object then null;
end $$;

create unique index if not exists delivery_notes_series_number_uq
  on public.delivery_notes (series, number)
  where series is not null and number is not null;

create index if not exists delivery_notes_order_idx on public.delivery_notes (order_id);
create index if not exists delivery_notes_scope_idx on public.delivery_notes (account_scope);
create index if not exists delivery_notes_status_idx on public.delivery_notes (status);

-- Backlink orders.delivery_note_id → delivery_notes
do $$ begin
  alter table public.orders
    add constraint orders_delivery_note_fk
    foreign key (delivery_note_id) references public.delivery_notes(id) on delete set null;
exception
  when duplicate_object then null;
end $$;

-- 9. Tabel cash_register_movements (wallet conta2) --------------------------
create table if not exists public.cash_register_movements (
    id uuid primary key default gen_random_uuid(),
    occurred_at timestamptz not null default now(),
    drawer text not null default 'main',
    direction text not null,
    amount numeric(12,2) not null check (amount > 0),
    reason text not null,
    order_id uuid references public.orders(id) on delete set null,
    expense_id uuid references public.expenses(id) on delete set null,
    notes text,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);

do $$ begin
  alter table public.cash_register_movements
    add constraint cash_direction_check
    check (direction in ('in','out'));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter table public.cash_register_movements
    add constraint cash_reason_check
    check (reason in ('sale','expense','top_up','withdrawal','adjustment'));
exception
  when duplicate_object then null;
end $$;

create index if not exists cash_movements_drawer_date_idx
  on public.cash_register_movements (drawer, occurred_at desc);

-- 10. Tabel panel_settings (key/value jsonb) --------------------------------
create table if not exists public.panel_settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz not null default now(),
    updated_by uuid references auth.users(id) on delete set null
);

-- Seed-uri implicite
insert into public.panel_settings (key, value) values
  ('internal_code.template',     to_jsonb('{seq:7}{letter}'::text)),
  ('internal_code.sequence',     to_jsonb(0)),
  ('internal_code.letter',       to_jsonb('A'::text)),
  ('invoice.series',             to_jsonb('M'::text)),
  ('invoice.next_number',        to_jsonb(528)),
  ('proforma.series',            to_jsonb('M'::text)),
  ('proforma.next_number',       to_jsonb(428)),
  ('po.series',                  to_jsonb('PO'::text)),
  ('po.next_number',             to_jsonb(1)),
  ('delivery_note.series',       to_jsonb('FL'::text)),
  ('delivery_note.next_number',  to_jsonb(1)),
  -- Datele firmei și banca pentru documente printabile (proformă, factură, PO).
  -- Sursa: documentul oficial „Date oficiale ale companiei pentru înregistrarea
  -- partenerilor". Editabile din /panel/setari sau direct în panel_settings.
  ('company.name',                    to_jsonb('Inter Bus Parts'::text)),
  ('company.legal_name',              to_jsonb('Inter Bus Parts S.R.L.'::text)),
  ('company.full_legal_name',         to_jsonb($$Societatea cu Răspundere Limitată „Inter Bus Parts"$$::text)),
  ('company.legal_form',              to_jsonb('SRL'::text)),
  ('company.administrator',           to_jsonb('Adrian Oborocean'::text)),
  ('company.address',                 to_jsonb('Stradela Dimo 9, Durlești, mun. Chișinău, Republica Moldova'::text)),
  ('company.country',                 to_jsonb('Republica Moldova'::text)),
  ('company.idno',                    to_jsonb('1026023029685'::text)),
  ('company.vat_number',              to_jsonb('1026023029685'::text)),
  ('company.vat_registration_number', to_jsonb('0510688'::text)),
  ('company.registration_date',       to_jsonb('2026-04-30'::text)),
  ('company.email',                   to_jsonb('adrian@inter-bus.md'::text)),
  ('company.phone',                   to_jsonb('+373 68 059 005'::text)),
  ('company.website',                 to_jsonb('www.inter-bus.md'::text)),
  -- Banca: două conturi maib (MDL + EUR)
  ('bank.mdl.iban',                   to_jsonb('MD44AG000000022517532551'::text)),
  ('bank.mdl.account_holder',         to_jsonb('Inter Bus Parts S.R.L.'::text)),
  ('bank.mdl.account_number',         to_jsonb('22517532551'::text)),
  ('bank.mdl.bank_name',              to_jsonb('maib (BC MAIB S.A.)'::text)),
  ('bank.mdl.swift',                  to_jsonb('AGRNMD2X'::text)),
  ('bank.eur.iban',                   to_jsonb('MD40AG000000022517532623'::text)),
  ('bank.eur.account_holder',         to_jsonb('Inter Bus Parts S.R.L.'::text)),
  ('bank.eur.account_number',         to_jsonb('22517532623'::text)),
  ('bank.eur.bank_name',              to_jsonb('maib (BC MAIB S.A.)'::text)),
  ('bank.eur.swift',                  to_jsonb('AGRNMD2X'::text)),
  -- Legacy single-bank keys (default to MDL pentru compatibilitate cu cod vechi)
  ('bank.account_name',               to_jsonb('Inter Bus Parts S.R.L.'::text)),
  ('bank.account_number',             to_jsonb('22517532551'::text)),
  ('bank.iban',                       to_jsonb('MD44AG000000022517532551'::text)),
  ('bank.swift',                      to_jsonb('AGRNMD2X'::text)),
  ('bank.name',                       to_jsonb('maib (BC MAIB S.A.)'::text))
on conflict (key) do nothing;

-- 11. RLS pe tabelele noi ----------------------------------------------------

-- helper macro inline: enable RLS + admin-only read/write
alter table public.suppliers                 enable row level security;
alter table public.purchases                 enable row level security;
alter table public.purchase_items            enable row level security;
alter table public.invoices                  enable row level security;
alter table public.expenses                  enable row level security;
alter table public.delivery_notes            enable row level security;
alter table public.cash_register_movements   enable row level security;
alter table public.panel_settings            enable row level security;

-- Policies (drop + recreate ca să fie idempotente)
drop policy if exists "suppliers_admin_read"  on public.suppliers;
drop policy if exists "suppliers_admin_write" on public.suppliers;
create policy "suppliers_admin_read"  on public.suppliers
    for select using (public.is_admin());
create policy "suppliers_admin_write" on public.suppliers
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "purchases_admin_read"  on public.purchases;
drop policy if exists "purchases_admin_write" on public.purchases;
create policy "purchases_admin_read"  on public.purchases
    for select using (public.is_admin());
create policy "purchases_admin_write" on public.purchases
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "purchase_items_admin_read"  on public.purchase_items;
drop policy if exists "purchase_items_admin_write" on public.purchase_items;
create policy "purchase_items_admin_read"  on public.purchase_items
    for select using (public.is_admin());
create policy "purchase_items_admin_write" on public.purchase_items
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "invoices_admin_read"  on public.invoices;
drop policy if exists "invoices_admin_write" on public.invoices;
create policy "invoices_admin_read"  on public.invoices
    for select using (public.is_admin());
create policy "invoices_admin_write" on public.invoices
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "expenses_admin_read"  on public.expenses;
drop policy if exists "expenses_admin_write" on public.expenses;
create policy "expenses_admin_read"  on public.expenses
    for select using (public.is_admin());
create policy "expenses_admin_write" on public.expenses
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "delivery_notes_admin_read"  on public.delivery_notes;
drop policy if exists "delivery_notes_admin_write" on public.delivery_notes;
create policy "delivery_notes_admin_read"  on public.delivery_notes
    for select using (public.is_admin());
create policy "delivery_notes_admin_write" on public.delivery_notes
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "cash_movements_admin_read"  on public.cash_register_movements;
drop policy if exists "cash_movements_admin_write" on public.cash_register_movements;
create policy "cash_movements_admin_read"  on public.cash_register_movements
    for select using (public.is_admin());
create policy "cash_movements_admin_write" on public.cash_register_movements
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "panel_settings_admin_read"  on public.panel_settings;
drop policy if exists "panel_settings_admin_write" on public.panel_settings;
create policy "panel_settings_admin_read"  on public.panel_settings
    for select using (public.is_admin());
create policy "panel_settings_admin_write" on public.panel_settings
    for all using (public.is_admin()) with check (public.is_admin());

-- 12. RPC next_internal_code() — incrementează secvența atomic ---------------
--
-- Returnează un tuplu (seq, letter) pe care TypeScript îl formatează după
-- template-ul din `panel_settings.internal_code.template`. Formatarea în SQL
-- ar însemna re-deploy la fiecare schimbare de template; o lăsăm în TS.
--
-- `SELECT ... FOR UPDATE` blochează rândul `internal_code.sequence` cât
-- timp incrementăm — alți clienți care apelează simultan așteaptă.
-- SECURITY DEFINER fiindcă apelantul (admin authenticated) are RLS write
-- access, dar funcția trebuie să poată citi/scrie panel_settings indiferent.

create or replace function public.next_internal_code(out next_seq bigint, out next_letter text)
returns record
language plpgsql
security definer
set search_path = public
as $$
declare
  current_seq bigint;
  current_letter text;
begin
  -- Lock the sequence row
  select (value)::text::bigint into current_seq
    from public.panel_settings
    where key = 'internal_code.sequence'
    for update;
  if current_seq is null then
    raise exception 'panel_settings row internal_code.sequence is missing';
  end if;

  -- Read letter (no lock needed; letter only changes on collision retry,
  -- handled in TS via a separate update). Default to 'A' if missing.
  select trim(both '"' from (value)::text) into current_letter
    from public.panel_settings
    where key = 'internal_code.letter';
  if current_letter is null or current_letter = '' then
    current_letter := 'A';
  end if;

  -- Increment + persist
  current_seq := current_seq + 1;
  update public.panel_settings
    set value = to_jsonb(current_seq), updated_at = now()
    where key = 'internal_code.sequence';

  next_seq := current_seq;
  next_letter := current_letter;
end $$;

grant execute on function public.next_internal_code() to authenticated;

-- 13. Audit-trail (optional) -------------------------------------------------
do $$ begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'app_settings') then
    insert into public.app_settings (key, value, updated_at)
    values ('panel_migration_applied_at', now()::text, now())
    on conflict (key) do update
      set value = excluded.value, updated_at = excluded.updated_at;
  end if;
end $$;

-- ============================================================================
-- Verificare (after running):
--
--   select key, value from public.panel_settings order by key;
--   -- expect 7 rows: internal_code.template, .sequence, .letter,
--   -- invoice.series, .next_number, delivery_note.series, .next_number
--
--   select column_name, data_type from information_schema.columns
--    where table_schema = 'public' and table_name = 'orders'
--      and column_name in ('account_scope','source','delivery_note_id');
--
--   select * from public.next_internal_code();  -- should bump sequence
--
-- ============================================================================
