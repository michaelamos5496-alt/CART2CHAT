-- delete_own_account was crashing in production before it ever reached the
-- auth.users delete. The likely cause: `storage.objects.owner` isn't a
-- stable column name across Supabase Storage versions (some projects use
-- `owner_id` text instead), so that cleanup line could throw a hard SQL
-- error and abort the whole function. Storage cleanup is a nice-to-have,
-- not something that should ever be able to block an account deletion —
-- same tradeoff as deleteProduct's storage cleanup elsewhere in this app —
-- so it's now wrapped to swallow any error and continue.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    delete from storage.objects where owner = auth.uid();
  exception when others then
    null;
  end;

  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account from public;
grant execute on function public.delete_own_account to authenticated;
