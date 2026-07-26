-- Temporarily removes the last remaining plan gate (max_products) so
-- every business can be tested without hitting a plan limit — nothing in
-- app code changes, since the product-limit trigger and the "at limit"
-- upgrade banners already read this value dynamically. Reversible by
-- restoring per-plan numbers later (e.g. starter=20, growth=200, pro=null)
-- whenever billing enforcement should come back.
update public.plan_limits
set max_products = null;
