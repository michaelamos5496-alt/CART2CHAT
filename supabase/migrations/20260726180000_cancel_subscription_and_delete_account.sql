-- Self-serve account controls: cancel a subscription (downgrade to the
-- free plan) and permanently delete an account. Neither exists as a
-- self-serve path today — business_subscriptions has no UPDATE policy for
-- owners at all (plan changes are deliberately admin/webhook-only, see
-- 20260725210000_subscriptions.sql), and account deletion isn't possible
-- from the client at all (auth.users can only be modified by the service
-- role or a definer function). Both are exposed here as narrowly-scoped
-- SECURITY DEFINER RPCs rather than opening up table policies, so an owner
-- can only ever act on their own row and can never self-upgrade.

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

  -- Always downgrades to the free plan — this function can never be used
  -- to set any other plan, so it can't be abused as a self-upgrade path.
  update public.business_subscriptions
  set plan = 'starter', status = 'cancelled'
  where business_id = v_business_id;
end;
$$;

revoke all on function public.cancel_subscription from public;
grant execute on function public.cancel_subscription to authenticated;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- storage.objects.owner references auth.users with no cascade action,
  -- which would otherwise block the delete below for any account that
  -- ever uploaded a product photo. Clearing the metadata rows first is
  -- the same accepted tradeoff as deleteProduct's storage cleanup: the
  -- underlying files are orphaned in the bucket rather than the account
  -- becoming undeletable.
  delete from storage.objects where owner = auth.uid();

  -- Cascades through profiles -> businesses -> categories/products/
  -- orders/subscriptions/product_options/etc, all defined ON DELETE
  -- CASCADE from businesses or profiles.
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account from public;
grant execute on function public.delete_own_account to authenticated;
