-- order_status_history is deliberately append-only with NO insert policy
-- for any role (see its table comment) — the trigger below is the only
-- sanctioned writer. But the trigger function was never declared
-- SECURITY DEFINER, so it ran with the privileges of whoever updated the
-- order (the authenticated owner), which RLS then correctly rejected —
-- "new row violates row-level security policy for table
-- order_status_history" on every single status change. SECURITY DEFINER
-- makes the trigger itself the writer, bypassing RLS the same way
-- is_super_admin() and the other trigger-only tables in this schema do.
create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
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
