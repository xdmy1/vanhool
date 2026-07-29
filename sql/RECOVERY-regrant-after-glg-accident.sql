-- ============================================================
--  RECUPERARE — un script GLG (școală auto) a fost rulat din greșeală pe
--  baza interbus și a făcut `REVOKE ALL ... FROM anon, authenticated` pe tot
--  schema public. NICIUN RÂND DE DATE nu a fost șters — doar permisiunile
--  rolurilor anon/authenticated au fost retrase, așa că aplicația nu mai poate
--  citi nimic (pare că nu mai ești admin / piesele au dispărut).
--
--  Acest script DOAR RE-ACORDĂ permisiunile (GRANT) — nu atinge / nu modifică
--  niciun rând. Politicile RLS (intacte) continuă să controleze accesul real
--  pe rânduri. Rulează-l în Supabase Studio → SQL Editor pe proiectul interbus.
--  Reface exact configurația implicită Supabase.
-- ============================================================

-- Acces la schema + la toate obiectele EXISTENTE
grant usage on schema public to anon, authenticated;

grant all on all tables    in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;

-- Și pe obiectele VIITOARE (default privileges — ca în setup-ul standard Supabase)
alter default privileges in schema public grant all on tables    to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;

-- service_role NU a fost atins de REVOKE (de-aia diagnosticul a putut citi
-- datele), dar îl re-acordăm defensiv ca să fie sigur configurația completă.
grant usage on schema public to service_role;
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- ============================================================
--  Verificare: după rulare, deschide /panel — adminul + piesele trebuie să
--  reapară. Sau rulează în editor:
--    select count(*) from public.products;   -- ~390
-- ============================================================
