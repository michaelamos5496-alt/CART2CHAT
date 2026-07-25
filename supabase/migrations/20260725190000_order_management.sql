create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  status public.order_status not null,
  changed_at timestamptz not null default now()
);

comment on table public.order_status_history is
  'Append-only log of status transitions per order, populated exclusively by
   the log_order_status_change trigger below — never written to directly by
   the app, so the timeline is always an accurate record.';

create index order_status_history_order_id_idx
  on public.order_status_history (order_id, changed_at);
create index order_status_history_business_id_idx
  on public.order_status_history (business_id);

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.order_status_history (order_id, business_id, status)
    values (new.id, new.business_id, new.status);
  elsif TG_OP = 'UPDATE' and new.status is distinct from old.status then
    insert into public.order_status_history (order_id, business_id, status)
    values (new.id, new.business_id, new.status);
  end if;

  return new;
end;
$$;

create trigger log_order_status_change_trigger
  after insert or update of status on public.orders
  for each row execute function public.log_order_status_change();

alter table public.order_status_history enable row level security;

create policy "Owners can view their own order status history"
  on public.order_status_history for select
  to authenticated
  using (public.owns_business(business_id));

-- No insert/update/delete policies for any role: rows are written
-- exclusively by the trigger above, which runs as the table owner and
-- bypasses RLS.
