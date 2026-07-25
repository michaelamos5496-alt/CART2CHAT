-- Super admin authorization -------------------------------------------------
--
-- Deliberately its own table with ZERO RLS policies (not even for the
-- admin themselves) rather than a boolean column on profiles. A boolean on
-- profiles would sit behind "Users can update their own profile", which
-- only restricts *which row*, not *which column* — nothing would stop a
-- user granting themselves admin. Because admin_users has no policies at
-- all, no anon/authenticated query can read or write it directly; the only
-- way in is is_super_admin() below (SECURITY DEFINER, bypasses RLS) or the
-- Supabase SQL editor / service role. Granting someone admin is therefore
-- always an explicit, out-of-band action:
--   insert into public.admin_users (user_id) values ('<auth-user-uuid>');
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

comment on function public.is_super_admin() is
  'True if the current auth.uid() is a platform super admin. The one
   sanctioned way to check admin_users from application code or RLS
   policies — never query admin_users directly, it has no policies.';

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

-- Account suspension ----------------------------------------------------
-- Distinct from businesses.is_active (an owner's own storefront
-- visibility toggle): suspension is a platform moderation action that also
-- locks the owner out of their dashboard, not just the public storefront.

alter table public.businesses
  add column is_suspended boolean not null default false,
  add column suspended_at timestamptz,
  add column suspended_reason text;

-- A suspended storefront must never be publicly visible, regardless of the
-- owner's own is_active toggle.
drop policy "Public can view active storefronts" on public.businesses;

create policy "Public can view active storefronts"
  on public.businesses for select
  to anon, authenticated
  using (is_active = true and is_suspended = false);

-- Admin RLS policies ------------------------------------------------------
-- Additive: these are permissive policies alongside the existing
-- owner-scoped ones (same table, combined with OR), so owner access is
-- unchanged.

create policy "Admins can view all businesses"
  on public.businesses for select
  to authenticated
  using (public.is_super_admin());

create policy "Admins can update any business"
  on public.businesses for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Admins can delete any business"
  on public.businesses for delete
  to authenticated
  using (public.is_super_admin());

create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_super_admin());

create policy "Admins can view all orders"
  on public.orders for select
  to authenticated
  using (public.is_super_admin());

create policy "Admins can view all order items"
  on public.order_items for select
  to authenticated
  using (public.is_super_admin());

create policy "Admins can view all subscriptions"
  on public.business_subscriptions for select
  to authenticated
  using (public.is_super_admin());

create policy "Admins can update any subscription"
  on public.business_subscriptions for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Admins can update plan limits"
  on public.plan_limits for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Platform feature flags --------------------------------------------------
-- Global on/off switches, independent of subscription plans (those are
-- plan_limits' job). Readable by everyone since flags like
-- new_signups_enabled / maintenance_mode gate public-facing pages
-- (signup, storefront) that anon visitors hit directly.

create table public.feature_flags (
  key text primary key,
  label text not null,
  description text,
  is_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger set_feature_flags_updated_at
  before update on public.feature_flags
  for each row execute function public.set_updated_at();

insert into public.feature_flags (key, label, description, is_enabled)
values
  ('new_signups_enabled', 'New signups', 'Allow new businesses to sign up. When off, the signup page shows a "paused" message instead of the form.', true),
  ('maintenance_mode', 'Maintenance mode', 'Show a maintenance page on all public storefronts instead of the usual store. Dashboards stay reachable.', false);

alter table public.feature_flags enable row level security;

create policy "Anyone can view feature flags"
  on public.feature_flags for select
  to anon, authenticated
  using (true);

create policy "Admins can update feature flags"
  on public.feature_flags for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());
