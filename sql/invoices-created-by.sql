-- Attribution: record WHICH admin raised each invoice / proforma.
--
-- The operator wants every document to show the name of the admin who
-- performed the action. We store both the user id (for a hard link) and a
-- denormalized name SNAPSHOT taken at creation time — so the credit stays
-- correct even if that admin's profile name later changes, and the list can
-- render it without a join.
--
-- Idempotent. Existing rows keep NULL (unknown author) — only new documents
-- get attributed.

alter table public.invoices
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists created_by_name text;

comment on column public.invoices.created_by is
  'The admin/operator who raised this invoice or proforma.';
comment on column public.invoices.created_by_name is
  'Name snapshot of the admin who raised it, frozen at creation time.';
 la achizitie, sa pot pune pretul fara tva si sa imi dea cu tva, dar sa pot pune si pretul cu tva si automat sa mi-l dea brut. si adica sa fie ca la vanzari cumva. sa pot scrie la achizitie in
  campul pret cu tva[