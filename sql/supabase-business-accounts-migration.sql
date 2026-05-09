-- ============================================================================
-- INTER BUS — Business / individual accounts on profiles
-- ============================================================================
-- Adaugă pe public.profiles câmpurile necesare pentru B2B:
--   • account_type — discriminator individual / business
--   • date companie (denumire, IDNO, formă juridică, contact + funcție)
--   • adresă juridică + adresă livrare (cu flag „aceeași")
--   • date fiscale (plătitor TVA, cod TVA local, EU VAT ID)
--
-- Idempotent. Sigur la rerulare.
-- ============================================================================

alter table public.profiles
    add column if not exists account_type text not null default 'individual'
        check (account_type in ('individual', 'business')),
    -- Person details (separate from full_name so we can re-construct cleanly)
    add column if not exists first_name text,
    add column if not exists last_name text,
    -- Company details
    add column if not exists company_name text,
    add column if not exists idno text,
    add column if not exists legal_form text,
    add column if not exists contact_position text,
    -- Billing / legal address
    add column if not exists billing_country text,
    add column if not exists billing_street text,
    add column if not exists billing_city text,
    add column if not exists billing_district text,
    add column if not exists billing_postal text,
    -- Shipping address
    add column if not exists shipping_same_as_billing boolean not null default true,
    add column if not exists shipping_country text,
    add column if not exists shipping_street text,
    add column if not exists shipping_city text,
    add column if not exists shipping_district text,
    add column if not exists shipping_postal text,
    -- Fiscal
    add column if not exists vat_payer boolean not null default false,
    add column if not exists vat_number text,
    add column if not exists eu_vat_id text;

create index if not exists profiles_account_type_idx
    on public.profiles (account_type);
create index if not exists profiles_idno_idx
    on public.profiles (idno) where idno is not null;

-- Constraint la nivel logic: dacă account_type='business', câmpurile
-- esențiale (company_name + idno) trebuie completate. Aplicăm soft check —
-- la nivel de aplicație validăm cu zod, dar punem și un check de bază.
alter table public.profiles drop constraint if exists profiles_business_required_chk;
alter table public.profiles
    add constraint profiles_business_required_chk check (
        account_type = 'individual'
        or (
            company_name is not null
            and length(trim(company_name)) > 0
            and idno is not null
            and length(trim(idno)) > 0
        )
    );

-- ============================================================================
-- Verify:
--   select column_name, data_type from information_schema.columns
--    where table_name = 'profiles'
--      and column_name in (
--        'account_type','company_name','idno','legal_form','contact_position',
--        'billing_country','billing_street','billing_city','billing_district',
--        'billing_postal','shipping_same_as_billing','shipping_country',
--        'shipping_street','shipping_city','shipping_district','shipping_postal',
--        'vat_payer','vat_number','eu_vat_id','first_name','last_name'
--      );
--
--   select email, account_type, company_name, idno from public.profiles
--    where account_type = 'business';
-- ============================================================================
