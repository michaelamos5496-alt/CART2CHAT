-- businesses is the tenant root: one row per storefront.
-- A single owner may run more than one storefront, so owner_id is not unique.
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  slug text not null
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  description text,
  whatsapp_number text not null check (whatsapp_number ~ '^\+[1-9]\d{6,14}$'),
  logo_url text,
  theme_color text not null default '#16A34A' check (theme_color ~ '^#[0-9A-Fa-f]{6}$'),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug)
);

comment on table public.businesses is
  'One row per tenant/storefront. Owner-scoped multi-tenancy root.';
comment on column public.businesses.slug is
  'Public storefront URL segment, e.g. orderflow.app/store/{slug}.';
comment on column public.businesses.whatsapp_number is
  'E.164 format, e.g. +15551234567. Orders are sent to this number.';

create index businesses_owner_id_idx on public.businesses (owner_id);
create index businesses_is_active_idx on public.businesses (is_active) where is_active;

create trigger set_businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- Helper used by every downstream table's RLS policies.
create or replace function public.owns_business(target_business_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = target_business_id
      and b.owner_id = auth.uid()
  );
$$;

comment on function public.owns_business(uuid) is
  'True if the current auth.uid() owns the given business. Central RLS building block.';

-- Row Level Security ----------------------------------------------------

alter table public.businesses enable row level security;

create policy "Public can view active storefronts"
  on public.businesses for select
  to anon, authenticated
  using (is_active = true);

create policy "Owners can view their own business"
  on public.businesses for select
  to authenticated
  using (owner_id = auth.uid());

create policy "Owners can create a business"
  on public.businesses for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Owners can update their own business"
  on public.businesses for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Owners can delete their own business"
  on public.businesses for delete
  to authenticated
  using (owner_id = auth.uid());
