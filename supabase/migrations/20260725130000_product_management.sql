create type public.product_status as enum ('draft', 'active', 'archived');

alter table public.products
  add column is_featured boolean not null default false,
  add column status public.product_status not null default 'active';

comment on column public.products.status is
  'Lifecycle state: draft/archived products never appear on the public
   storefront regardless of is_available. is_available is a separate,
   finer-grained "in stock right now" toggle for otherwise active products.';

create index products_business_featured_idx
  on public.products (business_id, is_featured) where is_featured;
create index products_business_status_idx
  on public.products (business_id, status);

-- The public storefront should only ever see active, available products.
drop policy "Public can view available products of active storefronts" on public.products;

create policy "Public can view available products of active storefronts"
  on public.products for select
  to anon, authenticated
  using (
    is_available = true
    and status = 'active'
    and exists (
      select 1 from public.businesses b
      where b.id = products.business_id and b.is_active = true
    )
  );

-- Slug generation for products, scoped per business (mirrors
-- generate_unique_business_slug from the auto-provisioning migration).
-- SECURITY INVOKER: relies on the caller being able to read their own
-- products (via the existing owner RLS policy) to check uniqueness, and on
-- owns_business() to authorize who may call it at all.
create or replace function public.generate_unique_product_slug(p_business_id uuid, p_base text)
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
    base_slug := 'product';
  end if;

  candidate := base_slug;

  while exists (
    select 1 from public.products
    where business_id = p_business_id and slug = candidate
  ) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  end loop;

  return candidate;
end;
$$;

revoke all on function public.generate_unique_product_slug(uuid, text) from public;
grant execute on function public.generate_unique_product_slug(uuid, text) to authenticated;
