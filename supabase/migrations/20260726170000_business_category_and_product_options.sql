-- Two additions, both aimed at the same problem: different kinds of shops
-- need different product options (a fashion store needs Size/Color, a
-- bakery might need Flavor, an electronics shop might need Storage).
-- Rather than hardcoding a fixed option set per category, businesses pick
-- a category for their own profile/context, and every product gets a
-- fully generic option system (custom option groups + values) that works
-- for any kind of shop.

create type public.business_category as enum (
  'fashion_apparel',
  'food_beverage',
  'beauty_cosmetics',
  'electronics',
  'home_living',
  'jewelry_accessories',
  'health_wellness',
  'other'
);

alter table public.businesses
  add column category public.business_category not null default 'other';

-- Generic per-product options -----------------------------------------
-- e.g. an option group named "Size" with values "S"/"M"/"L", or "Color"
-- with "Red"/"Blue". Deliberately not tied to business_category — a
-- fashion shop and a jewelry shop might both want a "Size" option, and
-- nothing stops any business from adding whatever option groups suit
-- their own catalog.

create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_options_product_id_idx on public.product_options (product_id);
create index product_options_business_id_idx on public.product_options (business_id);

create or replace function public.set_product_option_business_id()
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

create trigger set_product_options_business_id
  before insert or update of product_id on public.product_options
  for each row execute function public.set_product_option_business_id();

alter table public.product_options enable row level security;

create policy "Public can view options of available products"
  on public.product_options for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      join public.businesses b on b.id = p.business_id
      where p.id = product_options.product_id
        and p.is_available = true
        and p.status = 'active'
        and b.is_active = true
        and b.is_suspended = false
    )
  );

create policy "Owners can manage their own product options"
  on public.product_options for all
  to authenticated
  using (public.owns_business(business_id))
  with check (public.owns_business(business_id));

create table public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  value text not null check (char_length(value) between 1 and 40),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_option_values_option_id_idx on public.product_option_values (option_id);
create index product_option_values_business_id_idx on public.product_option_values (business_id);

create or replace function public.set_product_option_value_business_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  select o.business_id into new.business_id
  from public.product_options o
  where o.id = new.option_id;

  if new.business_id is null then
    raise exception 'product option % not found', new.option_id;
  end if;

  return new;
end;
$$;

create trigger set_product_option_values_business_id
  before insert or update of option_id on public.product_option_values
  for each row execute function public.set_product_option_value_business_id();

alter table public.product_option_values enable row level security;

create policy "Public can view values of available products' options"
  on public.product_option_values for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.product_options o
      join public.products p on p.id = o.product_id
      join public.businesses b on b.id = p.business_id
      where o.id = product_option_values.option_id
        and p.is_available = true
        and p.status = 'active'
        and b.is_active = true
        and b.is_suspended = false
    )
  );

create policy "Owners can manage their own product option values"
  on public.product_option_values for all
  to authenticated
  using (public.owns_business(business_id))
  with check (public.owns_business(business_id));

-- Orders need to remember which options a customer picked ----------------

alter table public.order_items
  add column selected_options jsonb not null default '[]'::jsonb;

comment on column public.order_items.selected_options is
  'Snapshot of the options picked at order time, e.g.
   [{"name": "Size", "value": "M"}, {"name": "Color", "value": "Blue"}] —
   a snapshot rather than a foreign key, same reasoning as product_name/
   unit_price: it must stay accurate even if the option is later renamed
   or removed from the product.';

drop function if exists public.place_order(uuid, text, text, text, text, jsonb);

create or replace function public.place_order(
  p_business_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_notes text,
  p_items jsonb -- [{ "product_id": "uuid", "quantity": 2, "selected_options": [{"name":"Size","value":"M"}] }, ...]
)
returns table (
  order_id uuid,
  order_number bigint,
  subtotal numeric,
  delivery_fee numeric,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_delivery_fee numeric(12, 2);
  v_item jsonb;
  v_product record;
  v_quantity integer;
  v_selected_options jsonb;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must include at least one item';
  end if;

  if p_customer_name is null or char_length(trim(p_customer_name)) = 0 then
    raise exception 'Customer name is required';
  end if;

  if p_customer_phone is null or char_length(trim(p_customer_phone)) = 0 then
    raise exception 'Customer phone is required';
  end if;

  if not exists (
    select 1 from public.businesses
    where id = p_business_id and is_active = true and is_suspended = false
  ) then
    raise exception 'Store not found or inactive';
  end if;

  select coalesce(bs.delivery_fee, 0) into v_delivery_fee
  from public.business_settings bs
  where bs.business_id = p_business_id;

  insert into public.orders (
    business_id, customer_name, customer_phone, customer_address, notes, status, delivery_fee
  )
  values (
    p_business_id,
    p_customer_name,
    p_customer_phone,
    nullif(trim(p_customer_address), ''),
    nullif(trim(p_notes), ''),
    'pending',
    coalesce(v_delivery_fee, 0)
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Item quantity must be a positive integer';
    end if;

    select p.id, p.name, p.price
    into v_product
    from public.products p
    where p.id = (v_item ->> 'product_id')::uuid
      and p.business_id = p_business_id
      and p.is_available = true
    for update;

    if not found then
      raise exception 'Product % is unavailable', v_item ->> 'product_id';
    end if;

    v_selected_options := coalesce(v_item -> 'selected_options', '[]'::jsonb);

    insert into public.order_items (
      order_id, business_id, product_id, product_name, unit_price, quantity, selected_options
    )
    values (
      v_order_id, p_business_id, v_product.id, v_product.name, v_product.price, v_quantity, v_selected_options
    );
  end loop;

  return query
    select
      o.id,
      o.order_number,
      o.total_amount - o.delivery_fee,
      o.delivery_fee,
      o.total_amount
    from public.orders o
    where o.id = v_order_id;
end;
$$;

revoke all on function public.place_order from public;
grant execute on function public.place_order to anon, authenticated;

-- Auto-provisioning: capture the category chosen at signup ---------------

create or replace function public.handle_user_email_confirmed_body(new_user auth.users)
returns auth.users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_name text;
  v_whatsapp_number text;
  v_category public.business_category;
begin
  begin
    if exists (select 1 from public.businesses where owner_id = new_user.id) then
      return new_user;
    end if;

    v_business_name := coalesce(nullif(trim(new_user.raw_user_meta_data ->> 'business_name'), ''), 'My Store');
    v_whatsapp_number := new_user.raw_user_meta_data ->> 'whatsapp_number';

    begin
      v_category := (new_user.raw_user_meta_data ->> 'business_category')::public.business_category;
    exception when others then
      v_category := null;
    end;
    v_category := coalesce(v_category, 'other');

    insert into public.businesses (owner_id, name, slug, whatsapp_number, category)
    values (
      new_user.id,
      v_business_name,
      public.generate_unique_business_slug(v_business_name),
      v_whatsapp_number,
      v_category
    );
  exception when others then
    raise warning 'auto-provision business failed for user %: %', new_user.id, sqlerrm;
  end;

  return new_user;
end;
$$;
