create table public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, slug)
);

comment on table public.categories is
  'Product categories, scoped per business.';

create index categories_business_id_idx on public.categories (business_id);
create index categories_business_active_idx on public.categories (business_id, is_active);

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- Row Level Security ----------------------------------------------------

alter table public.categories enable row level security;

create policy "Public can view active categories of active storefronts"
  on public.categories for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.businesses b
      where b.id = categories.business_id and b.is_active = true
    )
  );

create policy "Owners can manage their own categories"
  on public.categories for all
  to authenticated
  using (public.owns_business(business_id))
  with check (public.owns_business(business_id));
