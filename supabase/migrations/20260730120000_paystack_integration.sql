-- Wires up Paystack as a real payment provider. "paystack" was missing
-- from the original provider check constraint (it only anticipated
-- "stripe"/"local"). The two new columns support Paystack's
-- disable/enable-subscription API (which needs the subscription code
-- *and* its email token) and the admin-side Plan sync (which needs
-- somewhere to remember each tier's Paystack plan_code).

alter table public.business_subscriptions
  drop constraint business_subscriptions_provider_check;

alter table public.business_subscriptions
  add constraint business_subscriptions_provider_check
  check (provider in ('none', 'stripe', 'local', 'paystack'));

alter table public.business_subscriptions
  add column paystack_email_token text;

alter table public.plan_limits
  add column paystack_plan_code text;
