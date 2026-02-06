create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create policy "Admins can read self"
on public.admins
for select
to authenticated
using (user_id = auth.uid());

create table if not exists public.appointments (
  id bigint generated always as identity primary key,
  barber text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.appointment_private (
  appointment_id bigint primary key references public.appointments (id) on delete cascade,
  client_name text not null,
  client_phone text not null,
  created_at timestamptz not null default now()
);

alter table public.appointments enable row level security;
alter table public.appointment_private enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

create policy "Public can create appointments"
on public.appointments
for insert
to anon, authenticated
with check (true);

create policy "Admins can read appointments"
on public.appointments
for select
to authenticated
using (public.is_admin());

create policy "Admins can delete appointments"
on public.appointments
for delete
to authenticated
using (public.is_admin());

create policy "Admins can read private appointment data"
on public.appointment_private
for select
to authenticated
using (public.is_admin());

create or replace function public.get_busy_slots(p_date date)
returns table (
  barber text,
  start_time timestamptz,
  end_time timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select a.barber, a.start_time, a.end_time
  from public.appointments a
  where a.start_time >= p_date::timestamptz
    and a.start_time < (p_date + 1)::timestamptz
  order by a.start_time asc;
$$;

create or replace function public.create_appointment(
  p_barber text,
  p_start_time timestamptz,
  p_client_name text,
  p_client_phone text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_end_time timestamptz;
  v_id bigint;
begin
  v_end_time := p_start_time + interval '30 minutes';

  if exists (
    select 1
    from public.appointments a
    where a.barber = p_barber
      and tstzrange(a.start_time, a.end_time, '[)') && tstzrange(p_start_time, v_end_time, '[)')
  ) then
    raise exception 'slot_not_available';
  end if;

  insert into public.appointments (barber, start_time, end_time)
  values (p_barber, p_start_time, v_end_time)
  returning id into v_id;

  insert into public.appointment_private (appointment_id, client_name, client_phone)
  values (v_id, p_client_name, p_client_phone);

  return v_id;
end;
$$;

grant select on public.admins to authenticated;
grant insert on public.appointments to anon, authenticated;
grant select, delete on public.appointments to authenticated;
grant select on public.appointment_private to authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_busy_slots(date) to anon, authenticated;
grant execute on function public.create_appointment(text, timestamptz, text, text) to anon, authenticated;
