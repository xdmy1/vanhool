# SQL migrations & seeds

Toate fișierele SQL pentru schema și datele inițiale ale proiectului.

## Cum aplici

Toate scripturile rulează în **Supabase Dashboard → SQL Editor → New query**.
Sunt **idempotente** (sigur de rulat de mai multe ori) și nu conțin
`drop table` sau `truncate` — n-au cum să șteargă date existente.

## Una-singură-de-rulat

Pentru un proiect nou (sau reset complet), rulează **un singur fișier**:

```
supabase-schema-all.sql
```

Conține tot: setup + vehicule + TecDoc + Odoo + producători + coduri
alternative + promoții + discount-uri + categorii + banner-e.

## Aplicate individual (ordine recomandată)

Dacă preferi pas cu pas:

| # | Fișier | Ce adaugă |
|---|---|---|
| 1 | `supabase-setup.sql` | Tabele core (profiles, categories, products, carts, orders, payments, contact_messages) + RLS + 12 categorii root + demo |
| 2 | `supabase-vehicles-migration.sql` | `vehicle_makes / models / types / part_link` + view `v_vehicle_breadcrumbs` |
| 3 | `supabase-tecdoc-migration.sql` | `tecdoc_id`, `oem_codes`, `vehicle_compatibility`, `images` pe products + tabelul `tecdoc_cache` |
| 4 | `supabase-odoo-migration.sql` | `odoo_id` cross-IDs pe products/profiles/orders + `odoo_sync_log` + helpers |
| 5 | `supabase-product-codes-migration.sql` | `manufacturers`, `product_vehicle_makes`, `cross_references jsonb`, `search_codes text[]` + trigger `normalize_code` |
| 6 | `supabase-promotions-migration.sql` | `is_promo`, `promo_price`, `promo_starts_at`, `promo_ends_at` + `product_effective_price()` |
| 7 | `supabase-customer-discount-migration.sql` | `profiles.discount_percent` + `apply_customer_discount()` |
| 8 | `supabase-categories-seed.sql` | 12 categorii root canonice + ~72 subcategorii (RO/EN/RU) |
| 9 | `supabase-category-banners.sql` | `categories.image_url` + URL-urile de banner pentru cele 12 categorii |
| 10 | `supabase-bus-makes-seed.sql` | 24 mărci/modele de autobuze (MAN, Mercedes, Van Hool, VDL etc.) |
| 11 | `supabase-mdl-migration.sql` | One-shot: convertește valorile EUR → MDL × 20. Idempotent prin flag |
| 12 | `supabase-business-accounts-migration.sql` | Câmpuri B2B pe profiles (account_type, company_name, idno, billing/shipping address, VAT) |
| 13 | `supabase-data-api-grants-migration.sql` | Grants explicite pe Data API (pre-cutoff 2026-10-30) |
| 14 | `supabase-panel-migration.sql` | `/panel` workspace: enum `account_scope`, coloane noi pe orders+products, tabele `suppliers / purchases / purchase_items / invoices / expenses / delivery_notes / cash_register_movements / panel_settings`, RPC `next_internal_code()`. Necesită creare manuală în Studio a bucket-urilor `purchase-docs` și `expense-receipts`. |

## Seed-uri de date vehicule (opționale)

Adaugă mărci și modele auto generale (nu doar autobuze) — utile dacă vrei
catalog complet pe vehicule, nu doar autobuze:

- `supabase-all-in-one-1.sql` … `supabase-all-in-one-4.sql` — chunk-uri TecDoc
- `supabase-vehicles-seed*.sql` — Wikidata seed pentru modele
- `supabase-vehicles-seed-mega-1.sql` … `mega-6.sql` — extinderi mari per brand
- `supabase-vehicles-enrichment.sql`, `supabase-enrichment-1..8.sql` — îmbogățiri

Aplică-le **doar dacă** ai nevoie de catalog vehicular complet. Pentru
flota de autobuze e suficient `supabase-bus-makes-seed.sql`.

## Utilități

- `supabase-vehicles-cleanup.sql` — curățare modele/types orfane sau de test
- `supabase-make-admin.sql` — promovează un user la admin
- `backfill-conta1-invoice-vat-extract.sql` — corectează facturile conta1 istorice scrise cu subtotal=BRUT/TVA=0 (recalculează subtotal=NET + TVA 20% extras). Idempotent. De rulat o dată după unificarea TVA-din-scope.

## Rollback

Niciunul din scripturi nu are rollback automat. Pentru a reveni la o stare
anterioară, restaurează din backup-ul Supabase (Database → Backups).
