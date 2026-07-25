-- logo_url was never populated by any app code yet (no upload UI existed),
-- so it's safe to repurpose as a storage path, matching the convention
-- already used by products and categories.
alter table public.businesses rename column logo_url to logo_path;
alter table public.businesses add column banner_path text;

comment on column public.businesses.logo_path is
  'Path into the logos storage bucket. Null until an image is uploaded.';
comment on column public.businesses.banner_path is
  'Path into the logos storage bucket. Null until an image is uploaded.';

-- Banners are wider than logos; the original 2MB cap was sized for logos only.
update storage.buckets set file_size_limit = 4194304 where id = 'logos';
