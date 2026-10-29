create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role public.app_role not null, unique(user_id, role));
alter table public.user_roles enable row level security;
grant select on public.user_roles to authenticated;
create or replace function public.has_role(_user_id uuid, _role public.app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "Users view own roles" on public.user_roles for select to authenticated using (auth.uid()=user_id);
insert into public.user_roles(user_id,role) values ('5083c3df-47ce-4201-abc0-110bf24ffb50','admin'),('06a3f843-60ff-493d-925c-5abd0b5a929c','admin');
create or replace function public.admin_user_stats() returns table(email text, signed_up timestamptz, last_sign_in timestamptz, genogram_count bigint, member_count bigint, last_edit timestamptz)
language plpgsql stable security definer set search_path=public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  return query select u.email::text, u.created_at, u.last_sign_in_at, count(g.id), coalesce(sum(jsonb_array_length(case when jsonb_typeof(g.data->'members')='array' then g.data->'members' else '[]'::jsonb end)),0)::bigint, max(g.updated_at)
  from auth.users u left join public.genograms g on g.user_id=u.id group by u.id order by u.created_at desc;
end $$;
revoke execute on function public.admin_user_stats() from public, anon;
grant execute on function public.admin_user_stats() to authenticated;