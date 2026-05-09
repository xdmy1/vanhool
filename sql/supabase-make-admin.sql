-- Promote adrian@radx.solutions to admin.
-- Run in Supabase Dashboard → SQL Editor.

insert into public.profiles (id, email, full_name, is_admin)
select id, email, coalesce(raw_user_meta_data->>'full_name', email), true
from auth.users
where email = 'adrian@radx.solutions'
on conflict (id) do update set is_admin = true;

-- Sanity check — should return one row with is_admin = true:
select p.id, p.email, p.full_name, p.is_admin
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'adrian@radx.solutions';
