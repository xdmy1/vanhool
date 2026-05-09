-- ============================================================================
-- INTER BUS — One-shot migration: EUR values → MDL (lei)
-- ============================================================================
-- Multiplică toate valorile monetare cu 20 (1 EUR ≈ 20 MDL).
-- Acoperă: products (price, cost_price, promo_price), orders (subtotal,
-- discount_amount, shipping_cost, total), promocodes (discount_value pentru
-- tipul fixed, min_order_amount), payments (amount, currency).
--
-- IDEMPOTENT prin tabel `app_settings` — flag-ul `currency_migrated_to_mdl`
-- previne dublarea conversiei dacă rulezi scriptul de mai multe ori.
--
-- IMPORTANT — citește înainte de a rula:
--   • dacă produsele tale conțin DEJA valori în lei (introduse manual
--     după switch), NU rula scriptul: le va înmulți cu 20.
--   • dacă produsele conțin valori în EUR (date legacy / demo), rulează
--     scriptul O SINGURĂ DATĂ. Flag-ul te protejează la rulări ulterioare.
--   • după rulare, verifică câteva rânduri în /admin/products să confirmi.
-- ============================================================================

-- 1. Tabel pentru flag-uri / metadata aplicație ------------------------------
create table if not exists public.app_settings (
    key text primary key,
    value text,
    updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "app_settings_admin_read" on public.app_settings;
create policy "app_settings_admin_read" on public.app_settings
    for select using (public.is_admin());

drop policy if exists "app_settings_admin_all" on public.app_settings;
create policy "app_settings_admin_all" on public.app_settings
    for all using (public.is_admin()) with check (public.is_admin());

-- 2. Conversia propriu-zisă, ghidată de flag -------------------------------
do $$
declare
    already_migrated boolean;
begin
    select exists (
        select 1 from public.app_settings where key = 'currency_migrated_to_mdl'
    ) into already_migrated;

    if already_migrated then
        raise notice 'Conversia EUR → MDL a fost deja aplicată. Skip.';
        return;
    end if;

    -- Products: preț listă, preț cost, preț promo
    update public.products set price = round(price::numeric * 20, 2);
    update public.products set cost_price = round(cost_price::numeric * 20, 2)
        where cost_price is not null;
    update public.products set promo_price = round(promo_price::numeric * 20, 2)
        where promo_price is not null;

    -- Orders: toate valorile monetare
    update public.orders set
        subtotal        = round(subtotal::numeric * 20, 2),
        discount_amount = round(discount_amount::numeric * 20, 2),
        shipping_cost   = round(shipping_cost::numeric * 20, 2),
        total           = round(total::numeric * 20, 2);

    -- Promocodes: doar reducerile FIXE și pragul minim de comandă
    update public.promocodes set discount_value = round(discount_value::numeric * 20, 2)
        where discount_type = 'fixed';
    update public.promocodes set min_order_amount = round(min_order_amount::numeric * 20, 2)
        where min_order_amount is not null;

    -- Payments: suma + monedă
    update public.payments set amount = round(amount::numeric * 20, 2)
        where amount is not null;
    update public.payments set currency = 'MDL'
        where currency = 'EUR' or currency is null;

    -- Marchează conversia ca finalizată
    insert into public.app_settings (key, value, updated_at)
        values ('currency_migrated_to_mdl', now()::text, now())
        on conflict (key) do update set value = excluded.value, updated_at = now();

    raise notice 'Conversie EUR → MDL aplicată. Toate valorile monetare × 20.';
end $$;

-- 3. Default-ul pentru tranzacții noi ----------------------------------------
alter table public.payments alter column currency set default 'MDL';

-- ============================================================================
-- Verify (rulează aceste interogări după ce ai aplicat scriptul):
--   select id, part_code, price, cost_price, promo_price from public.products
--    order by created_at desc limit 5;
--
--   select code, discount_type, discount_value, min_order_amount from public.promocodes;
--
--   select key, value, updated_at from public.app_settings
--    where key = 'currency_migrated_to_mdl';
-- ============================================================================

-- ============================================================================
-- DACĂ AI RULAT GREȘIT (de ex. ai aplicat conversia, apoi ai re-introdus
-- prețuri în lei și ai rulat din nou) — anulează flag-ul și împarte la 20:
--
--   delete from public.app_settings where key = 'currency_migrated_to_mdl';
--   update public.products set price = round(price / 20, 2);
--   update public.products set cost_price = round(cost_price / 20, 2)
--     where cost_price is not null;
--   -- etc. pentru celelalte tabele
-- ============================================================================
