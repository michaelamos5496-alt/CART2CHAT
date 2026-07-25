-- Generic trigger function that keeps `updated_at` current on every UPDATE.
-- Reused by every table below that has an updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function: stamps updated_at = now() on every row update.';
