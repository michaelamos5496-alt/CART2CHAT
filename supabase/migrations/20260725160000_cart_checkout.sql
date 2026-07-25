alter table public.business_settings
  add column delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0);

comment on column public.business_settings.delivery_fee is
  'Flat delivery fee added to every order total. 0 = free/no delivery fee.';

alter table public.orders
  add column delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0);

comment on column public.orders.delivery_fee is
  'Snapshot of business_settings.delivery_fee at the time the order was
   placed, so a later fee change never rewrites historical order totals.';

-- total_amount is now items + delivery_fee (previously items only).
create or replace function public.recalculate_order_total()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  affected_order_id uuid;
  items_total numeric(12, 2);
begin
  affected_order_id := coalesce(new.order_id, old.order_id);

  select coalesce(sum(subtotal), 0) into items_total
  from public.order_items
  where order_id = affected_order_id;

  update public.orders
  set total_amount = items_total + delivery_fee
  where id = affected_order_id;

  return null;
end;
$$;

-- Existing recalculate_order_total_on_change trigger (order_items AFTER
-- INSERT/UPDATE/DELETE) already invokes this function; nothing to re-create.

-- Switch the template to literal newlines instead of pre-encoded %0A, so the
-- app can safely encodeURIComponent() the fully-substituted message exactly
-- once when building a wa.me link (encoding an already-encoded %0A would
-- have turned it into %250A).
alter table public.business_settings
  alter column whatsapp_message_template
  set default 'Order #{{order_number}} from {{customer_name}} ({{customer_phone}}):

{{items}}

Subtotal: {{subtotal}}
Delivery: {{delivery_fee}}
Total: {{total}}

Address: {{address}}
Notes: {{notes}}';

update public.business_settings
set whatsapp_message_template = 'Order #{{order_number}} from {{customer_name}} ({{customer_phone}}):

{{items}}

Subtotal: {{subtotal}}
Delivery: {{delivery_fee}}
Total: {{total}}

Address: {{address}}
Notes: {{notes}}'
where whatsapp_message_template =
  'New order from {{customer_name}}:%0A{{items}}%0A%0ATotal: {{total}}%0AAddress: {{address}}';

-- place_order now snapshots delivery_fee onto the order and returns a full
-- totals breakdown, so the client can show an authoritative success summary
-- without re-deriving numbers itself. Return type is changing, so the
-- function must be dropped and recreated rather than CREATE OR REPLACE'd.
drop function if exists public.place_order(uuid, text, text, text, text, jsonb);

create or replace function public.place_order(
  p_business_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_notes text,
  p_items jsonb -- [{ "product_id": "uuid", "quantity": 2 }, ...]
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
    select 1 from public.businesses where id = p_business_id and is_active = true
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

    -- Lock the product row and re-read its price server-side; the client's
    -- price (if it sent one) is ignored entirely.
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

    insert into public.order_items (order_id, business_id, product_id, product_name, unit_price, quantity)
    values (v_order_id, p_business_id, v_product.id, v_product.name, v_product.price, v_quantity);
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

comment on function public.place_order(uuid, text, text, text, text, jsonb) is
  'Atomically creates an order + order_items for a public storefront checkout.
   SECURITY DEFINER: customers never need direct table access; prices and the
   delivery fee are always re-read server-side, never trusted from the client.';

revoke all on function public.place_order(uuid, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(uuid, text, text, text, text, jsonb) to anon, authenticated;
