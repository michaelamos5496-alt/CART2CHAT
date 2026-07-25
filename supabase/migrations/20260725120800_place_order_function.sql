-- The only way a customer (anon or authenticated) can create an order.
-- Runs as SECURITY DEFINER so it can insert into orders/order_items despite
-- those tables having no INSERT policy for anon/authenticated. All product
-- prices are re-read from public.products inside the transaction — the
-- client only ever supplies product_id + quantity, never a price.
create or replace function public.place_order(
  p_business_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_notes text,
  p_items jsonb -- [{ "product_id": "uuid", "quantity": 2 }, ...]
)
returns table (order_id uuid, order_number bigint, total_amount numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
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

  insert into public.orders (business_id, customer_name, customer_phone, customer_address, notes, status)
  values (
    p_business_id,
    p_customer_name,
    p_customer_phone,
    nullif(trim(p_customer_address), ''),
    nullif(trim(p_notes), ''),
    'pending'
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
    select o.id, o.order_number, o.total_amount
    from public.orders o
    where o.id = v_order_id;
end;
$$;

comment on function public.place_order(uuid, text, text, text, text, jsonb) is
  'Atomically creates an order + order_items for a public storefront checkout.
   SECURITY DEFINER: customers never need direct table access, and prices are
   always re-read server-side from products, never trusted from the client.';

-- Least privilege: revoke the implicit PUBLIC grant, then grant explicitly
-- only to the roles that need it.
revoke all on function public.place_order(uuid, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(uuid, text, text, text, text, jsonb) to anon, authenticated;
