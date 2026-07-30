-- Distinguishes auto-renewing card subscriptions (tied to a Paystack
-- Plan) from one-time Mobile Money charges that the customer has to pay
-- again manually before current_period_end — Paystack's recurring
-- subscriptions only support Card as a channel, so Mobile Money has to
-- go through a plan-less, one-off transaction instead.

alter table public.business_subscriptions
  add column billing_mode text not null default 'recurring'
  check (billing_mode in ('recurring', 'manual'));
