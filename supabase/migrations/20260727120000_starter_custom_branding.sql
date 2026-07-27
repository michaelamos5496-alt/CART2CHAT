-- Custom logo & banner is now available on every plan, not just Growth/Pro.

update public.plan_limits
set has_custom_branding = true
where plan = 'starter';
