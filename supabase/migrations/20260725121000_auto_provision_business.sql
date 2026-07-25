-- Turns "My Coffee Shop" into "my-coffee-shop".
create or replace function public.slugify(input text)
returns text
language sql
immutable
set search_path = public
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'),
      '-{2,}', '-', 'g'
    )
  );
$$;

-- Finds a free businesses.slug starting from a base, appending -2, -3, ...
create or replace function public.generate_unique_business_slug(base text)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  base_slug text;
  candidate text;
  suffix integer := 1;
begin
  base_slug := left(public.slugify(base), 50);
  if base_slug = '' then
    base_slug := 'store';
  end if;

  candidate := base_slug;

  while exists (select 1 from public.businesses where slug = candidate) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  end loop;

  return candidate;
end;
$$;

-- Automatically provisions a business (which in turn auto-creates its
-- business_settings row via the on_business_created trigger) the moment a
-- user confirms their email. business_name / whatsapp_number are captured
-- at signup time via auth.signUp({ options: { data: { ... } } }) and land
-- in raw_user_meta_data.
create or replace function public.handle_user_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_name text;
  v_whatsapp_number text;
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    begin
      if exists (select 1 from public.businesses where owner_id = new.id) then
        return new;
      end if;

      v_business_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'business_name'), ''), 'My Store');
      v_whatsapp_number := new.raw_user_meta_data ->> 'whatsapp_number';

      insert into public.businesses (owner_id, name, slug, whatsapp_number)
      values (
        new.id,
        v_business_name,
        public.generate_unique_business_slug(v_business_name),
        v_whatsapp_number
      );
    exception when others then
      -- Never let storefront auto-provisioning block email confirmation
      -- itself. Surface it in the logs instead.
      raise warning 'auto-provision business failed for user %: %', new.id, sqlerrm;
    end;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_user_email_confirmed();
