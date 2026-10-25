-- ClientOS schema. Run in Supabase SQL editor.
create extension if not exists pgcrypto;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, created_at timestamptz not null default now()
);
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null, email text, created_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  price numeric(12,2) not null default 0,
  currency text not null default 'INR',
  deadline date,
  revision_limit int not null default 2 check (revision_limit >= 0),
  status text not null default 'active' check (status in ('active','awaiting_approval','approved','archived')),
  review_slug text not null unique default encode(gen_random_bytes(9),'hex'),
  created_at timestamptz not null default now()
);
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version int not null default 1, storage_path text not null,
  created_at timestamptz not null default now(),
  unique (project_id, version)
);
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null, -- null = client
  author_name text not null,
  timestamp_sec numeric not null check (timestamp_sec >= 0),
  body text not null check (length(body) between 1 and 2000),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete set null,
  title text not null, description text, timestamp_sec numeric,
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  created_at timestamptz not null default now()
);
create table public.revisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  video_id uuid references public.videos(id) on delete set null,
  note text, created_at timestamptz not null default now()
);
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade, -- unique = locked once
  video_id uuid references public.videos(id),
  approved_by text not null, approved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  amount numeric(12,2) not null, currency text not null,
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  provider text not null default 'mock', created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.users(id, full_name) values (new.id, new.raw_user_meta_data->>'full_name'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.owns_project(pid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from projects where id = pid and user_id = auth.uid()) $$;

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.videos enable row level security;
alter table public.comments enable row level security;
alter table public.tasks enable row level security;
alter table public.revisions enable row level security;
alter table public.approvals enable row level security;
alter table public.payments enable row level security;

create policy "own profile" on public.users for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own clients" on public.clients for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own projects" on public.projects for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own videos" on public.videos for all using (owns_project(project_id)) with check (owns_project(project_id));
create policy "owner reads comments" on public.comments for select using (owns_project(project_id));
create policy "owner adds comments" on public.comments for insert with check (owns_project(project_id) and user_id = auth.uid());
create policy "owner updates comments" on public.comments for update using (owns_project(project_id)); -- resolve, edit
create policy "own comments delete" on public.comments for delete using (user_id = auth.uid());
create policy "own tasks" on public.tasks for all using (owns_project(project_id)) with check (owns_project(project_id));
create policy "own revisions" on public.revisions for all using (owns_project(project_id)) with check (owns_project(project_id));
create policy "owner reads approvals" on public.approvals for select using (owns_project(project_id));
create policy "own payments" on public.payments for all using (owns_project(project_id)) with check (owns_project(project_id));
-- No anon policies. Public access ONLY via the functions below.

create function public.get_review(p_slug text) returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'project', json_build_object('id',p.id,'name',p.name,'status',p.status,'revision_limit',p.revision_limit,
      'revisions_used',(select count(*) from revisions r where r.project_id=p.id)),
    'video', (select row_to_json(v) from (select id,version,storage_path from videos where project_id=p.id order by version desc limit 1) v),
    'comments', coalesce((select json_agg(c order by c.timestamp_sec) from (select id,video_id,author_name,timestamp_sec,body,status,created_at,(user_id is null) as by_client from comments where project_id=p.id) c),'[]'::json),
    'approval', (select row_to_json(a) from (select approved_by,approved_at from approvals where project_id=p.id) a))
  from projects p where p.review_slug = p_slug $$;

create function public.add_review_comment(p_slug text, p_author text, p_ts numeric, p_body text) returns uuid
language plpgsql security definer set search_path = public as $$
declare pr projects; vid uuid; cid uuid;
begin
  select * into pr from projects where review_slug = p_slug;
  if not found then raise exception 'not_found'; end if;
  if exists(select 1 from approvals where project_id = pr.id) then raise exception 'already_approved'; end if;
  select id into vid from videos where project_id = pr.id order by version desc limit 1;
  if vid is null then raise exception 'no_video'; end if;
  insert into comments(project_id, video_id, author_name, timestamp_sec, body)
    values (pr.id, vid, left(trim(p_author),80), p_ts, trim(p_body)) returning id into cid;
  return cid;
end $$;

create function public.request_review_changes(p_slug text, p_note text) returns void
language plpgsql security definer set search_path = public as $$
declare pr projects;
begin
  select * into pr from projects where review_slug = p_slug;
  if not found then raise exception 'not_found'; end if;
  if exists(select 1 from approvals where project_id = pr.id) then raise exception 'already_approved'; end if;
  insert into revisions(project_id, video_id, note)
    values (pr.id, (select id from videos where project_id=pr.id order by version desc limit 1), p_note);
  update projects set status='active' where id = pr.id;
end $$;

create function public.approve_review(p_slug text, p_name text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare pr projects; ts timestamptz;
begin
  select * into pr from projects where review_slug = p_slug;
  if not found then raise exception 'not_found'; end if;
  insert into approvals(project_id, video_id, approved_by)
    values (pr.id, (select id from videos where project_id=pr.id order by version desc limit 1), left(trim(p_name),80))
    returning approved_at into ts;
  update projects set status='approved' where id = pr.id;
  return ts;
end $$;

revoke all on function public.get_review, public.add_review_comment, public.request_review_changes, public.approve_review from public;
grant execute on function public.get_review, public.add_review_comment, public.request_review_changes, public.approve_review to anon, authenticated;

-- Storage: create a private bucket "videos" first, then:
create policy "editor uploads own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "editor reads own folder" on storage.objects for select to authenticated
  using (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);
