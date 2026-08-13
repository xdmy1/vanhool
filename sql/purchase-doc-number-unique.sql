-- ============================================================================
-- Achiziții: seria facturii furnizorului este UNICĂ — aceeași factură nu
-- poate fi introdusă de două ori (dublează stocul, costul și TVA deductibil).
--
-- Aplicația refuză deja duplicatele la salvare (createPurchase /
-- updatePurchase compară seria normalizată). Acest index e plasa de
-- siguranță la nivel de bază de date: chiar și un insert direct nu mai
-- poate repeta o serie.
--
-- Normalizare: public.normalize_code() — majuscule + doar litere/cifre,
-- deci "AAZ 2277474", "aaz-2277474" și "AAZ2277474" sunt aceeași serie.
-- Documentele `cancelled` sunt exceptate: reintroducerea după o anulare
-- e legitimă.
--
-- PASUL 0 — OBLIGATORIU: rulează întâi SELECT-ul de mai jos. Dacă întoarce
-- rânduri, șterge copiile în plus din panel (butonul Șterge — inversează și
-- stocul), apoi rulează restul. Cu duplicate încă prezente, indexul nu se
-- poate crea (scriptul doar avertizează, nu strică nimic).
--
-- Idempotent: poate fi rulat de oricâte ori.
-- ============================================================================

-- PASUL 0 — duplicatele existente (de curățat din panel înainte):
select
  public.normalize_code(p.document_number) as serie_normalizata,
  count(*)                                 as cate_ori,
  array_agg(p.id order by p.created_at)    as purchase_ids,
  array_agg(p.document_date::text order by p.created_at) as date_document
from public.purchases p
where p.document_number is not null
  and public.normalize_code(p.document_number) <> ''
  and p.status <> 'cancelled'
group by 1
having count(*) > 1
order by 1;

-- normalize_code() vine din sql/supabase-product-codes-migration.sql; o
-- creăm doar dacă lipsește (nu suprascriem varianta deja instalată).
do $$
begin
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'normalize_code'
  ) then
    create function public.normalize_code(input text)
    returns text
    language sql
    immutable
    as $fn$
      select regexp_replace(upper(coalesce(input, '')), '[^A-Z0-9]', '', 'g');
    $fn$;
    grant execute on function public.normalize_code(text) to anon, authenticated;
  end if;
end $$;

-- Indexul unic (parțial: ignoră seriile goale și documentele anulate).
do $$
begin
  create unique index if not exists purchases_doc_number_unique
    on public.purchases (public.normalize_code(document_number))
    where document_number is not null
      and public.normalize_code(document_number) <> ''
      and status <> 'cancelled';
exception
  when unique_violation then
    raise notice 'Indexul NU a fost creat: există încă serii duplicate. Rulează SELECT-ul de la PASUL 0, șterge copiile în plus din panel, apoi rulează scriptul din nou.';
end $$;
