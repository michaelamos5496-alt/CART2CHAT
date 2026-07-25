create type public.subscription_plan as enum ('starter', 'growth', 'pro');

-- Reference table: the limits/features attached to each plan. Single source
-- of truth for both database-level enforcement (the triggers below) and the
-- app (dashboard billing page, upgrade prompts) — nothing hardcodes these
-- numbers a second time.
create table public.plan_limits (
  plan public.subscription_plan primary key,
  monthly_price numeric(10, 2) not null default 0,
  yearly_price numeric(10, 2) not null default 0,
  max_products integer, -- null = unlimited
  max_categories integer, -- null = unlimited
  has_full_analytics boolean not null default false,
  has_custom_branding boolean not null default false
);

comment on table public.plan_limits is
  'Global reference data, not owner-scoped. Read by the app to render plan
   comparisons/upgrade prompts and by the enforcement triggers on products
   and categories. Indicative pricing only — nothing charges against it yet.';

insert into public.plan_limits (plan, monthly_price, yearly_price, max_products, max_categories, has_full_analytics, has_custom_branding)
values
  ('starter', 0, 0, 20, 3, false, false),
  ('growth', 19, 15, 200, null, true, true),
  ('pro', 49, 39, null, null, true, true);

alter table public.plan_limits enable row level security;

create policy "Anyone can view plan limits"
  on public.plan_limits for select
  to anon, authenticated
  using (true);

-- Per-business subscription state. Deliberately has no INSERT/UPDATE policy
-- for anon/authenticated: today the only writer is the auto-provisioning
-- trigger below (runs as table owner, bypasses RLS). Once real billing
-- exists, a Stripe/local-payment webhook handler using the service-role key
-- (which also bypasses RLS) becomes the second and only other writer —
-- plan changes are never self-serve from the client, by design.
create table public.business_subscriptions (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  plan public.subscription_plan not null default 'starter',
  status text not null default 'active',
  provider text not null default 'none',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_subscriptions_status_check
    check (status in ('active', 'trialing', 'past_due', 'cancelled')),
  constraint business_subscriptions_provider_check
    check (provider in ('none', 'stripe', 'local'))
);

comment on table public.business_subscriptions is
  'provider/provider_customer_id/provider_subscription_id/current_period_end
   are unused today (provider = "none") but are the integration points a
   future Stripe or local payment-processor webhook handler will populate —
   this table exists now so that work is additive, not a schema migration
   under pressure later.';

create trigger set_business_subscriptions_updated_at
  before update on public.business_subscriptions
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_business_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_subscriptions (business_id)
  values (new.id)
  on conflict (business_id) do nothing;

  return new;
end;
$$;

create trigger on_business_created_subscription
  after insert on public.businesses
  for each row execute function public.handle_new_business_subscription();

alter table public.business_subscriptions enable row level security;

create policy "Owners can view their own subscription"
  on public.business_subscriptions for select
  to authenticated
  using (public.owns_business(business_id));

-- Product/category creation limits -----------------------------------------

create or replace function public.enforce_product_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_plan public.subscription_plan;
  v_max_products integer;
  v_current_count integer;
begin
  select coalesce(bs.plan, 'starter') into v_plan
  from public.business_subscriptions bs
  where bs.business_id = new.business_id;

  select pl.max_products into v_max_products
  from public.plan_limits pl
  where pl.plan = coalesce(v_plan, 'starter');

  if v_max_products is not null then
    select count(*) into v_current_count
    from public.products
    where business_id = new.business_id;

    if v_current_count >= v_max_products then
      raise exception
        'Product limit reached for the % plan (% products). Upgrade to add more.',
        coalesce(v_plan, 'starter'), v_max_products;
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_product_limit_trigger
  before insert on public.products
  for each row execute function public.enforce_product_limit();

create or replace function public.enforce_category_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_plan public.subscription_plan;
  v_max_categories integer;
  v_current_count integer;
begin
  select coalesce(bs.plan, 'starter') into v_plan
  from public.business_subscriptions bs
  where bs.business_id = new.business_id;

  select pl.max_categories into v_max_categories
  from public.plan_limits pl
  where pl.plan = coalesce(v_plan, 'starter');

  if v_max_categories is not null then
    select count(*) into v_current_count
    from public.categories
    where business_id = new.business_id;

    if v_current_count >= v_max_categories then
      raise exception
        'Category limit reached for the % plan (% categories). Upgrade to add more.',
        coalesce(v_plan, 'starter'), v_max_categories;
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_category_limit_trigger
  before insert on public.categories
  for each row execute function public.enforce_category_limit();
