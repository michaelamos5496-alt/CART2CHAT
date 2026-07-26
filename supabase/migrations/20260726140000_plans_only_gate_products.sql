-- Every plan-gated capability in the app (max_categories, has_full_analytics,
-- has_custom_branding) reads dynamically from plan_limits — none of it is
-- hardcoded per plan in application code. So making "only the product count
-- differs between tiers" true is a data change here, not a code change:
-- every gate downstream (the category-limit trigger, the analytics lock,
-- the branding-upload check) automatically reflects this once the
-- underlying row says so.
update public.plan_limits
set
  max_categories = null,
  has_full_analytics = true,
  has_custom_branding = true;

comment on column public.plan_limits.max_categories is
  'Unlimited on every plan as of 2026-07-26 — only max_products still
   differs between tiers. Column stays (rather than being dropped) so a
   future pricing change can reintroduce a per-plan limit without a schema
   migration.';
