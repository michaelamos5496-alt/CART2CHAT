-- Account deletion (Supabase Admin API -> auth.users delete -> cascades
-- through profiles -> businesses) was failing with an opaque 500 from the
-- Auth API. The likely cause: audit_business_deletion is a BEFORE DELETE
-- trigger on businesses that writes to admin_audit_log, and it now also
-- fires when a business is deleted as a side effect of that cascade — a
-- context with no authenticated request (auth.uid() has nothing to read),
-- unlike the admin-dashboard deletions this trigger was originally built
-- for. Whatever it's tripping on, an audit-log write must never be able
-- to block the deletion itself, same tradeoff already applied to storage
-- cleanup — so it's wrapped to swallow any error and continue.

create or replace function public.audit_business_deletion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    perform public.log_admin_action(
      'delete',
      'businesses',
      old.id,
      jsonb_build_object('name', old.name, 'slug', old.slug)
    );
  exception when others then
    null;
  end;

  return old;
end;
$$;
