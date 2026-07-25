alter table public.business_settings
  add column social_links jsonb not null default '{}'::jsonb;

comment on column public.business_settings.social_links is
  'Optional social/website links shown on the storefront, e.g.
   {"instagram": "https://instagram.com/...", "website": "https://..."}.
   Keys are free-form; the app currently writes a fixed set
   (instagram, facebook, tiktok, twitter, website).';

comment on column public.business_settings.business_hours is
  'Per-day opening hours, e.g.
   {"monday": {"open": "09:00", "close": "17:00", "closed": false}, ...}.
   Keys are lowercase day names; missing days are treated as unset in the UI
   (it fills sensible defaults) rather than at the database level.';
