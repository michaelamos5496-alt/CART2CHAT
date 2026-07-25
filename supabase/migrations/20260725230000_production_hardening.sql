-- Production hardening: search performance, a suspension-bypass fix, and
-- an admin action audit log. Additive only, no changes to prior migrations.

-- Search performance ---------------------------------------------------
-- Every user-facing search in the app does a leading-wildcard ILIKE
-- (`%term%`), which a plain btree index can't accelerate — Postgres falls
-- back to a sequential scan. pg_trgm's GIN indexes are the standard fix:
-- they support ILIKE '%term%' directly. Applied to every column an ILIKE
-- search actually runs against (products/categories names are
-- business_id-scoped so this matters less there today; businesses.name /
-- .slug back the platform-wide admin search across every business, which
-- is the one most likely to get slow as the platform grows).
create extension if not exists pg_trgm;

create index if not exists products_name_trgm_idx
  on public.products using gin (name gin_trgm_ops);

create index if not exists categories_name_trgm_idx
  on public.categories using gin (name gin_trgm_ops);

create index if not exists businesses_name_trgm_idx
  on public.businesses using gin (name gin_trgm_ops);

create index if not exists businesses_slug_trgm_idx
  on public.businesses using gin (slug gin_trgm_ops);

create index if not exists orders_customer_name_trgm_idx
  on public.orders using gin (customer_name gin_trgm_ops);

create index if not exists orders_customer_phone_trgm_idx
  on public.orders using gin (customer_phone gin_trgm_ops);

-- Suspension-bypass fix --------------------------------------------------
-- "Owners can update their own business" (businesses migration) checks
-- owner_id = auth.uid() but, being row-level RLS, does not — and cannot on
-- its own — restrict which *columns* an owner is allowed to touch. That
-- means a suspended owner could call the exact same update the dashboard
-- uses for anything else (e.g. changing the store name) and simply
-- include is_suspended: false in the payload, un-suspending themselves.
-- Fix: a BEFORE UPDATE trigger that, whenever the update is not coming
-- from a super admin, forces the suspension columns back to their old
-- values regardless of what the client sent — admins go through
-- "Admins can update any business" and are unaffected.
create or replace function public.protect_suspension_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    new.is_suspended := old.is_suspended;
    new.suspended_at := old.suspended_at;
    new.suspended_reason := old.suspended_reason;
  end if;
  return new;
end;
$$;

comment on function public.protect_suspension_columns() is
  'Prevents a business owner from clearing their own suspension via a
   normal update() call — only public.is_super_admin() can change these
   three columns. See migration comment for the full story.';

create trigger protect_suspension_columns
  before update on public.businesses
  for each row execute function public.protect_suspension_columns();

-- Admin audit log ---------------------------------------------------------
-- Every admin mutation (suspend/unsuspend, plan override, feature flag
-- toggle) currently goes straight from the browser to Supabase, guarded
-- only by RLS's is_super_admin() check — correct, but a single point of
-- failure with no record of what happened if that check is ever wrong.
-- These triggers log automatically at the database layer, so there's an
-- audit trail regardless of which admin UI (or future API) made the
-- change. No RLS policies allow insert/update/delete on this table from
-- application code — the SECURITY DEFINER function below is the only
-- writer, same pattern as admin_users/is_super_admin().
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

create policy "Admins can view the audit log"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_super_admin());

create or replace function public.log_admin_action(
  p_action text,
  p_target_table text,
  p_target_id uuid,
  p_detail jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_audit_log (admin_id, action, target_table, target_id, detail)
  values (auth.uid(), p_action, p_target_table, p_target_id, p_detail);
$$;

revoke all on function public.log_admin_action from public;

create or replace function public.audit_business_suspension()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_suspended is distinct from old.is_suspended then
    perform public.log_admin_action(
      case when new.is_suspended then 'suspend' else 'unsuspend' end,
      'businesses',
      new.id,
      jsonb_build_object('reason', new.suspended_reason)
    );
  end if;
  return new;
end;
$$;

create trigger audit_business_suspension
  after update on public.businesses
  for each row execute function public.audit_business_suspension();

create or replace function public.audit_business_deletion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_admin_action(
    'delete',
    'businesses',
    old.id,
    jsonb_build_object('name', old.name, 'slug', old.slug)
  );
  return old;
end;
$$;

create trigger audit_business_deletion
  before delete on public.businesses
  for each row execute function public.audit_business_deletion();

create or replace function public.audit_plan_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.plan is distinct from old.plan then
    perform public.log_admin_action(
      'plan_change',
      'business_subscriptions',
      new.business_id,
      jsonb_build_object('from', old.plan, 'to', new.plan)
    );
  end if;
  return new;
end;
$$;

create trigger audit_plan_change
  after update on public.business_subscriptions
  for each row execute function public.audit_plan_change();

create or replace function public.audit_feature_flag_toggle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_enabled is distinct from old.is_enabled then
    perform public.log_admin_action(
      case when new.is_enabled then 'flag_enabled' else 'flag_disabled' end,
      'feature_flags',
      null,
      jsonb_build_object('key', new.key)
    );
  end if;
  return new;
end;
$$;

create trigger audit_feature_flag_toggle
  after update on public.feature_flags
  for each row execute function public.audit_feature_flag_toggle();
