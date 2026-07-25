create type public.order_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity,
  business_id uuid not null references public.businesses (id) on delete cascade,
  status public.order_status not null default 'pending',
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  customer_phone text not null check (customer_phone ~ '^\+?[0-9\s-]{7,20}$'),
  customer_address text,
  notes text,
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  whatsapp_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is
  'total_amount is never trusted from the client: it is maintained exclusively
   by the recalculate_order_total trigger below, derived from order_items.';

create index orders_business_id_idx on public.orders (business_id);
create index orders_business_status_idx on public.orders (business_id, status);
create index orders_business_created_at_idx on public.orders (business_id, created_at desc);

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Order items ---------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(12, 2) generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now()
);

comment on table public.order_items is
  'product_name/unit_price are snapshots taken at order time so historical
   orders stay accurate even if the product is later renamed, repriced, or
   deleted (product_id then goes null but the line item survives).';

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_business_id_idx on public.order_items (business_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- Keep business_id in sync with the parent order, regardless of client input.
create or replace function public.set_order_item_business_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  select o.business_id into new.business_id
  from public.orders o
  where o.id = new.order_id;

  if new.business_id is null then
    raise exception 'order % not found', new.order_id;
  end if;

  return new;
end;
$$;

create trigger set_order_items_business_id
  before insert or update of order_id on public.order_items
  for each row execute function public.set_order_item_business_id();

-- Keep orders.total_amount authoritative: always the sum of its items.
create or replace function public.recalculate_order_total()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  affected_order_id uuid;
begin
  affected_order_id := coalesce(new.order_id, old.order_id);

  update public.orders
  set total_amount = coalesce(
    (select sum(subtotal) from public.order_items where order_id = affected_order_id),
    0
  )
  where id = affected_order_id;

  return null;
end;
$$;

create trigger recalculate_order_total_on_change
  after insert or update or delete on public.order_items
  for each row execute function public.recalculate_order_total();

-- Row Level Security ----------------------------------------------------
-- Customers place orders exclusively through the public.place_order() RPC
-- (SECURITY DEFINER, next migration). There is intentionally no INSERT
-- policy for anon/authenticated on orders or order_items: direct table
-- writes from customers are never allowed, which closes the window for
-- tampering with prices, totals, or order status.

alter table public.orders enable row level security;

create policy "Owners can manage their own orders"
  on public.orders for all
  to authenticated
  using (public.owns_business(business_id))
  with check (public.owns_business(business_id));

alter table public.order_items enable row level security;

create policy "Owners can manage their own order items"
  on public.order_items for all
  to authenticated
  using (public.owns_business(business_id))
  with check (public.owns_business(business_id));
