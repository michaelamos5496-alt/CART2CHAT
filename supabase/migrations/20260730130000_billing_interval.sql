-- Adds real yearly billing alongside monthly. Paystack Plans are
-- interval-locked, so yearly needs its own plan_code per tier — can't
-- reuse the monthly one. business_subscriptions.billing_interval tracks
-- which interval an active subscription is actually on.

alter table public.plan_limits
  add column paystack_yearly_plan_code text;

alter table public.business_subscriptions
  add column billing_interval text not null default 'monthly'
  check (billing_interval in ('monthly', 'yearly'));

-- yearly_price has been sitting equal to monthly_price (pre-Paystack
-- placeholder) — set a real ~2-months-free discount as a starting point;
-- admin can still hand-edit via /admin/plans.
update public.plan_limits
set yearly_price = monthly_price * 10;
