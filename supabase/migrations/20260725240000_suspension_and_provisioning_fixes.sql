-- Two correctness bugs found in a multi-tenant isolation audit, both fixed
-- here. Additive only — existing migrations are untouched.

-- Bug 1: suspension was cosmetic everywhere except the businesses row -----
-- itself. place_order() and the public SELECT policies on products,
-- categories, product_images, and business_settings all checked
-- b.is_active = true but never b.is_suspended = false. A suspended
-- business's storefront was hidden from the businesses listing, but its
-- products/categories/settings stayed directly readable, and place_order()
-- would still happily accept new orders for it.

drop function if exists public.place_order(uuid, text, text, text, text, jsonb);

create or replace function public.place_order(
  p_business_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_notes text,
  p_items jsonb
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

revoke all on function public.place_order from public;
grant execute on function public.place_order to anon, authenticated;

drop policy "Public can view available products of active storefronts" on public.products;

create policy "Public can view available products of active storefronts"
  on public.products for select
  to anon, authenticated
  using (
    is_available = true
    and status = 'active'
    and exists (
      select 1 from public.businesses b
      where b.id = products.business_id
        and b.is_active = true
        and b.is_suspended = false
    )
  );

drop policy "Public can view active categories of active storefronts" on public.categories;

create policy "Public can view active categories of active storefronts"
  on public.categories for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.businesses b
      where b.id = categories.business_id
        and b.is_active = true
        and b.is_suspended = false
    )
  );

drop policy "Public can view images of available products" on public.product_images;

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
        and b.is_suspended = false
    )
  );

drop policy "Public can view settings of active storefronts" on public.business_settings;

create policy "Public can view settings of active storefronts"
  on public.business_settings for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_settings.business_id
        and b.is_active = true
        and b.is_suspended = false
    )
  );

-- Bug 2: auto-provisioning never fires when email confirmation is off -----
-- handle_user_email_confirmed() is bound to "after update of
-- email_confirmed_at" on auth.users. When a Supabase project has email
-- confirmations disabled, Supabase sets email_confirmed_at at INSERT time,
-- not via a later UPDATE — so that trigger never fires, the user gets a
-- session with no business, and every dashboard page silently renders
-- blank forever (see the pending-provisioning fallback page for what
-- happens now instead). Fix: also provision from an AFTER INSERT trigger.
-- handle_user_email_confirmed()'s own idempotency check (bails out if a
-- business already exists for owner_id) makes it safe to fire from both
-- triggers without double-provisioning.

create or replace function public.handle_user_inserted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null then
    perform public.handle_user_email_confirmed_body(new);
  end if;
  return new;
end;
$$;

-- Shared body extracted out of handle_user_email_confirmed so both the
-- INSERT and UPDATE triggers run identical provisioning logic.
create or replace function public.handle_user_email_confirmed_body(new_user auth.users)
returns auth.users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_name text;
  v_whatsapp_number text;
begin
  begin
    if exists (select 1 from public.businesses where owner_id = new_user.id) then
      return new_user;
    end if;

    v_business_name := coalesce(nullif(trim(new_user.raw_user_meta_data ->> 'business_name'), ''), 'My Store');
    v_whatsapp_number := new_user.raw_user_meta_data ->> 'whatsapp_number';

    insert into public.businesses (owner_id, name, slug, whatsapp_number)
    values (
      new_user.id,
      v_business_name,
      public.generate_unique_business_slug(v_business_name),
      v_whatsapp_number
    );
  exception when others then
    raise warning 'auto-provision business failed for user %: %', new_user.id, sqlerrm;
  end;

  return new_user;
end;
$$;

create or replace function public.handle_user_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    perform public.handle_user_email_confirmed_body(new);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_inserted
  after insert on auth.users
  for each row execute function public.handle_user_inserted();
