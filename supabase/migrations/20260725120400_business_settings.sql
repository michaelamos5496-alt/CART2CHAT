-- business_settings holds operational/storefront settings, split from
-- businesses to keep the tenant row lean and this one free to grow.
create table public.business_settings (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  business_hours jsonb not null default '{}'::jsonb,
  order_number_prefix text not null default 'ORD'
    check (char_length(order_number_prefix) between 1 and 10),
  whatsapp_message_template text not null default
    'New order from {{customer_name}}:%0A{{items}}%0A%0ATotal: {{total}}%0AAddress: {{address}}',
  min_order_amount numeric(12, 2) check (min_order_amount is null or min_order_amount >= 0),
  auto_confirm_orders boolean not null default false,
  notify_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.business_settings is
  '1:1 operational settings for a business, auto-created when the business is.';

create trigger set_business_settings_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

-- Auto-create default settings whenever a business is created.
create or replace function public.handle_new_business()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_settings (business_id)
  values (new.id)
  on conflict (business_id) do nothing;

  return new;
end;
$$;

create trigger on_business_created
  after insert on public.businesses
  for each row execute function public.handle_new_business();

-- Row Level Security ----------------------------------------------------

alter table public.business_settings enable row level security;

create policy "Public can view settings of active storefronts"
  on public.business_settings for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_settings.business_id
        and b.is_active = true
    )
  );

create policy "Owners can view their own settings"
  on public.business_settings for select
  to authenticated
  using (public.owns_business(business_id));

create policy "Owners can update their own settings"
  on public.business_settings for update
  to authenticated
  using (public.owns_business(business_id))
  with check (public.owns_business(business_id));

-- No INSERT/DELETE policies: the row is created by the trigger above and
-- removed via the ON DELETE CASCADE from businesses.
