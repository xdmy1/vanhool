-- ============================================================================
-- INTER BUS — Category banners
-- Adaugă coloana image_url pe categorii + setează banner-ele pentru cele 12
-- rădăcini canonice. Idempotent.
-- ============================================================================

alter table public.categories
    add column if not exists image_url text;

update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002317_remmen_290.jpeg'                    where slug = 'brakes';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002342_luchtdruk_290.png'                  where slug = 'air-pressure';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002325_chassis-ophanging_290.jpeg'         where slug = 'chassis';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002320_electro_290.jpeg'                   where slug = 'electro';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002321_motor-aanbouw_290.jpeg'             where slug = 'engine';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002322_koppeling-versnellingsbak_290.jpeg' where slug = 'clutch';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002323_stuurinrichting-asnaven_290.jpeg'   where slug = 'steering';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002324_carrosserie_290.jpeg'               where slug = 'body';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002326_airco-verwarming_290.jpeg'          where slug = 'cooling';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0013827_silicone-leiding_290.jpeg'          where slug = 'hoses';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0014966_abc-raufoss-luchtkoppelingen_290.png' where slug = 'couplings';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002327_interieur_290.jpeg'                 where slug = 'interior';

-- ============================================================================
-- Verify:
--   select slug, name_ro, image_url from public.categories
--    where parent_id is null and is_active = true
--    order by sort_order;
-- ============================================================================
