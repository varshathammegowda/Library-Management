-- College Library & Digital Resource Management System
create extension if not exists "pgcrypto";

create type public.user_role as enum ('student','admin');
create type public.borrow_status as enum ('pending','approved','rejected','returned');
create type public.resource_type as enum ('PDF','E-book','Study Material','Useful Link');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  student_id text unique,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  category text not null,
  description text,
  isbn text,
  total_copies integer not null check (total_copies > 0),
  available_copies integer not null check (available_copies >= 0 and available_copies <= total_copies),
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.borrow_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete restrict,
  request_date timestamptz not null default now(),
  status public.borrow_status not null default 'pending',
  approved_at timestamptz,
  due_date timestamptz,
  returned_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists one_active_request_per_student_book
on public.borrow_requests(student_id, book_id)
where status in ('pending','approved');

create table if not exists public.digital_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  resource_type public.resource_type not null,
  category text not null default 'General',
  file_url text,
  thumbnail_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'); $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, email, student_id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name','Student'),
    new.email,
    nullif(new.raw_user_meta_data->>'student_id',''),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Keep updated_at current.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists books_updated_at on public.books;
create trigger books_updated_at before update on public.books for each row execute procedure public.touch_updated_at();

-- Atomic borrow request creation.
create or replace function public.request_book(p_book_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare rid uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not exists(select 1 from books where id=p_book_id and available_copies > 0) then raise exception 'No copies currently available'; end if;
  insert into borrow_requests(student_id,book_id,status) values(auth.uid(),p_book_id,'pending') returning id into rid;
  return rid;
exception when unique_violation then
  raise exception 'You already have an active request for this book';
end;
$$;

-- Atomic approval: checks availability and decrements exactly once.
create or replace function public.approve_borrow_request(p_request_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare bid uuid; rid uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select book_id into bid from borrow_requests where id=p_request_id and status='pending' for update;
  if bid is null then raise exception 'Request is no longer pending'; end if;
  update books set available_copies=available_copies-1 where id=bid and available_copies>0;
  if not found then raise exception 'No copies currently available'; end if;
  update borrow_requests set status='approved', approved_at=now(), due_date=now()+interval '14 days' where id=p_request_id returning id into rid;
  return rid;
end;
$$;

create or replace function public.reject_borrow_request(p_request_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare rid uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  update borrow_requests set status='rejected' where id=p_request_id and status='pending' returning id into rid;
  if rid is null then raise exception 'Request is no longer pending'; end if;
  return rid;
end;
$$;

create or replace function public.return_book(p_request_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare bid uuid; rid uuid;
begin
  select book_id into bid from borrow_requests where id=p_request_id and student_id=auth.uid() and status='approved' for update;
  if bid is null then raise exception 'Active loan not found'; end if;
  update borrow_requests set status='returned', returned_at=now() where id=p_request_id returning id into rid;
  update books set available_copies=least(total_copies, available_copies+1) where id=bid;
  return rid;
end;
$$;

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.borrow_requests enable row level security;
alter table public.digital_resources enable row level security;

-- Profiles: users can read/update their own safe fields; admins can manage.
create policy "profiles_select_own_or_admin" on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles for update using (id=auth.uid() or public.is_admin()) with check (id=auth.uid() or public.is_admin());
create policy "profiles_admin_insert" on public.profiles for insert with check (public.is_admin());

-- Books: public-to-authenticated read; admin write.
create policy "books_read_authenticated" on public.books for select using (auth.uid() is not null);
create policy "books_admin_insert" on public.books for insert with check (public.is_admin());
create policy "books_admin_update" on public.books for update using (public.is_admin()) with check (public.is_admin());
create policy "books_admin_delete" on public.books for delete using (public.is_admin());

-- Borrow records: students see own; admins see all. Inserts/updates happen through secure RPCs.
create policy "borrow_select_own_or_admin" on public.borrow_requests for select using (student_id=auth.uid() or public.is_admin());

-- Digital resources: authenticated read; admin write.
create policy "resources_read_authenticated" on public.digital_resources for select using (auth.uid() is not null);
create policy "resources_admin_insert" on public.digital_resources for insert with check (public.is_admin());
create policy "resources_admin_update" on public.digital_resources for update using (public.is_admin()) with check (public.is_admin());
create policy "resources_admin_delete" on public.digital_resources for delete using (public.is_admin());

-- Storage bucket. Run this once if the bucket does not already exist.
insert into storage.buckets (id, name, public) values ('digital-resources','digital-resources',true)
on conflict (id) do nothing;

create policy "digital_resources_public_read" on storage.objects for select using (bucket_id='digital-resources');
create policy "digital_resources_admin_insert" on storage.objects for insert with check (bucket_id='digital-resources' and public.is_admin());
create policy "digital_resources_admin_update" on storage.objects for update using (bucket_id='digital-resources' and public.is_admin());
create policy "digital_resources_admin_delete" on storage.objects for delete using (bucket_id='digital-resources' and public.is_admin());

-- RPC execution permissions.
revoke all on function public.request_book(uuid) from public;
grant execute on function public.request_book(uuid) to authenticated;
revoke all on function public.return_book(uuid) from public;
grant execute on function public.return_book(uuid) to authenticated;
revoke all on function public.approve_borrow_request(uuid) from public;
grant execute on function public.approve_borrow_request(uuid) to authenticated;
revoke all on function public.reject_borrow_request(uuid) from public;
grant execute on function public.reject_borrow_request(uuid) to authenticated;
