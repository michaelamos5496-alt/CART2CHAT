-- Every plan is paid now (Starter is ₵100/mo, not free), so the old
-- "cancel = downgrade to Starter" behavior no longer actually cancels
-- anything — it just moves the owner to a cheaper plan they'd still owe
-- for. This migration makes cancellation real:
--   - cancel_subscription() marks the subscription cancelled AND hides
--     the storefront (reuses the existing is_active flag + all the RLS
--     policies already gated on it — no new policies needed).
--   - protect_suspension_columns (already a BEFORE UPDATE guard on
--     businesses) now also stops a cancelled owner from just flipping
--     their own storefront visibility back on via Settings.
--   - enforce_product_limit blocks *any* new product while cancelled,
--     not just over-the-limit ones.
-- Reactivation is admin-only (updateBusinessPlan in the admin dashboard),
-- consistent with upgrades already being admin/support-assisted since
-- there's no payment processor wired up yet.

create or replace function public.cancel_subscription()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
begin
  select id into v_business_id
  from public.businesses
  where owner_id = auth.uid();

  if v_business_id is null then
    raise exception 'No business found for current user';
  end if;

  update public.business_subscriptions
  set status = 'cancelled'
  where business_id = v_business_id;

  update public.businesses
  set is_active = false
  where id = v_business_id;
end;
$$;

create or replace function public.protect_suspension_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cancelled boolean;
begin
  if not public.is_super_admin() then
    new.is_suspended := old.is_suspended;
    new.suspended_at := old.suspended_at;
    new.suspended_reason := old.suspended_reason;

    select (bs.status = 'cancelled') into v_cancelled
    from public.business_subscriptions bs
    where bs.business_id = old.id;

    if coalesce(v_cancelled, false) then
      new.is_active := false;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.enforce_product_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_plan public.subscription_plan;
  v_status text;
  v_max_products integer;
  v_current_count integer;
begin
  select bs.plan, bs.status into v_plan, v_status
  from public.business_subscriptions bs
  where bs.business_id = new.business_id;

  if v_status = 'cancelled' then
    raise exception 'Your subscription is cancelled — resubscribe to add products.';
  end if;

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
