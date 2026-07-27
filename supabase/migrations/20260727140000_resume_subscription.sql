-- Mirror of cancel_subscription(): a self-serve way back in. There's still
-- no payment processor, so this doesn't charge anything — it just clears
-- the cancelled status and restores storefront visibility, the same trust
-- level the rest of the app already operates at. Owner-scoped like
-- cancel_subscription, so a business can only resume its own subscription.

create or replace function public.resume_subscription()
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
  set status = 'active'
  where business_id = v_business_id;

  -- Runs after the status update above, so the protect_suspension_columns
  -- trigger (which forces is_active back to false while status =
  -- 'cancelled') sees the already-cleared status and lets this through.
  update public.businesses
  set is_active = true
  where id = v_business_id;
end;
$$;

revoke all on function public.resume_subscription from public;
grant execute on function public.resume_subscription to authenticated;
