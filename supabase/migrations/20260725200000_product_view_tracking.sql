alter table public.products
  add column view_count integer not null default 0 check (view_count >= 0);

comment on column public.products.view_count is
  'Incremented via increment_product_view() on each public storefront product
   page render. A simple running counter rather than a per-view log table —
   analytics only ever needs the aggregate, not individual view history.';

create index products_business_view_count_idx
  on public.products (business_id, view_count desc);

-- Callable by anon (real customers viewing the storefront). SECURITY
-- DEFINER since anon has no UPDATE grant on products otherwise. Scoped to
-- currently-public products only, matching what a real page view means.
create or replace function public.increment_product_view(p_product_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
  set view_count = view_count + 1
  where id = p_product_id
    and is_available = true
    and status = 'active';
$$;

revoke all on function public.increment_product_view(uuid) from public;
grant execute on function public.increment_product_view(uuid) to anon, authenticated;
