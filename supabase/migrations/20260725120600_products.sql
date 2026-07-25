create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  price numeric(12, 2) not null check (price >= 0),
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, slug)
);

comment on table public.products is
  'Catalog items, scoped per business. Price is authoritative and always read
   server-side when an order is placed — never trusted from the client.';

create index products_business_id_idx on public.products (business_id);
create index products_category_id_idx on public.products (category_id);
create index products_business_available_idx on public.products (business_id, is_available);

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Guard against attaching a category from a different business.
create or replace function public.check_product_category_business()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.category_id is not null and not exists (
    select 1 from public.categories c
    where c.id = new.category_id and c.business_id = new.business_id
  ) then
    raise exception 'category % does not belong to business %', new.category_id, new.business_id;
  end if;

  return new;
end;
$$;

create trigger enforce_product_category_business
  before insert or update of category_id, business_id on public.products
  for each row execute function public.check_product_category_business();

-- Row Level Security ----------------------------------------------------

alter table public.products enable row level security;

create policy "Public can view available products of active storefronts"
  on public.products for select
  to anon, authenticated
  using (
    is_available = true
    and exists (
      select 1 from public.businesses b
      where b.id = products.business_id and b.is_active = true
    )
  );

create policy "Owners can manage their own products"
  on public.products for all
  to authenticated
  using (public.owns_business(business_id))
  with check (public.owns_business(business_id));

-- Product images ----------------------------------------------------------

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  storage_path text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.product_images is
  'storage_path points into the product-images storage bucket, prefixed by
   {business_id}/... so storage policies can verify ownership.';

create index product_images_product_id_idx on public.product_images (product_id);
create index product_images_business_id_idx on public.product_images (business_id);

-- Keep the denormalized business_id in sync with the parent product,
-- regardless of what the client sends.
create or replace function public.set_product_image_business_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  select p.business_id into new.business_id
  from public.products p
  where p.id = new.product_id;

  if new.business_id is null then
    raise exception 'product % not found', new.product_id;
  end if;

  return new;
end;
$$;

create trigger set_product_images_business_id
  before insert or update of product_id on public.product_images
  for each row execute function public.set_product_image_business_id();

alter table public.product_images enable row level security;

create policy "Public can view images of available products"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      join public.businesses b on b.id = p.business_id
      where p.id = product_images.product_id
        and p.is_available = true
        and b.is_active = true
    )
  );

create policy "Owners can manage their own product images"
  on public.product_images for all
  to authenticated
  using (public.owns_business(business_id))
  with check (public.owns_business(business_id));
