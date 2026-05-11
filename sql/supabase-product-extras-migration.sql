-- ============================================================================
-- INTER BUS — Optional product spec extras
-- Adaugă: length (mm) + rib_count (număr nervuri, pt curele striate).
-- Ambele opționale: când rămân null, nu se afișează pe pagina de produs.
-- Idempotent.
-- ============================================================================

alter table public.products
    add column if not exists length numeric(10,2),
    add column if not exists rib_count integer;
