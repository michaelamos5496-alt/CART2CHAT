-- Account deletion now goes through the Supabase Admin Auth API (service
-- role, called from a server action) instead of a SQL function deleting
-- straight from auth.users — that approach proved unreliable in
-- production. This function is no longer called by the app.

drop function if exists public.delete_own_account();
