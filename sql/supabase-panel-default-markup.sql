-- =============================================================================
-- Seed the configurable default markup % used by the panel when prefilling a
-- new product from a purchase line and when postPurchase auto-creates one.
-- Editable from /panel/setari. Idempotent: skips if the row already exists.
-- =============================================================================

insert into public.panel_settings (key, value)
values ('pricing.default_markup_percent', '30'::jsonb)
on conflict (key) do nothing;
