-- Buckets -------------------------------------------------------------------
-- Both buckets are public-read (storefronts are public pages) but writes are
-- restricted to the owning business via the policies below.
-- Path convention for both buckets: {business_id}/{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos', 'logos', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('product-images', 'product-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- True if the first path segment of a storage object name is a business the
-- current user owns. Used by every write policy below.
create or replace function public.owns_storage_business_folder(object_name text)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.owner_id = auth.uid()
      and b.id::text = (storage.foldername(object_name))[1]
  );
$$;

-- logos ----------------------------------------------------------------

create policy "Public can view logos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'logos');

create policy "Owners can upload their own logo"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'logos' and public.owns_storage_business_folder(name));

create policy "Owners can update their own logo"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'logos' and public.owns_storage_business_folder(name))
  with check (bucket_id = 'logos' and public.owns_storage_business_folder(name));

create policy "Owners can delete their own logo"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'logos' and public.owns_storage_business_folder(name));

-- product-images ---------------------------------------------------------

create policy "Public can view product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Owners can upload their own product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.owns_storage_business_folder(name));

create policy "Owners can update their own product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.owns_storage_business_folder(name))
  with check (bucket_id = 'product-images' and public.owns_storage_business_folder(name));

create policy "Owners can delete their own product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.owns_storage_business_folder(name));
