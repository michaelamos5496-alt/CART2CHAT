alter table public.categories add column image_path text;

comment on column public.categories.image_path is
  'Path into the category-images storage bucket. Null until an image is uploaded.';

create index categories_business_sort_idx
  on public.categories (business_id, sort_order);

-- Slug generation for categories, scoped per business (mirrors
-- generate_unique_product_slug / generate_unique_business_slug).
create or replace function public.generate_unique_category_slug(p_business_id uuid, p_base text)
returns text
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  base_slug text;
  candidate text;
  suffix integer := 1;
begin
  if not public.owns_business(p_business_id) then
    raise exception 'not authorized';
  end if;

  base_slug := left(public.slugify(p_base), 50);
  if base_slug = '' then
    base_slug := 'category';
  end if;

  candidate := base_slug;

  while exists (
    select 1 from public.categories
    where business_id = p_business_id and slug = candidate
  ) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  end loop;

  return candidate;
end;
$$;

revoke all on function public.generate_unique_category_slug(uuid, text) from public;
grant execute on function public.generate_unique_category_slug(uuid, text) to authenticated;

-- Storage bucket for category images -----------------------------------
-- Path convention matches the other buckets: {business_id}/{category_id}/{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'category-images',
  'category-images',
  true,
  3145728,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

create policy "Public can view category images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'category-images');

create policy "Owners can upload their own category images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'category-images' and public.owns_storage_business_folder(name));

create policy "Owners can update their own category images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'category-images' and public.owns_storage_business_folder(name))
  with check (bucket_id = 'category-images' and public.owns_storage_business_folder(name));

create policy "Owners can delete their own category images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'category-images' and public.owns_storage_business_folder(name));
