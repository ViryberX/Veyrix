-- ==============================================================================
-- VEYRIX SAAS — COMPLETE ONE-CLICK SUPABASE SETUP SCRIPT
-- Brand: Veyrix — "Build beyond limits."
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. USER PROFILES
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  avatar_url text,
  role text default 'Member' not null check (role in ('Owner', 'Admin', 'Member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 2. ORGANIZATIONS / WORKSPACES
-- ==============================================================================
create table if not exists public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  plan text default 'Starter' not null check (plan in ('Starter', 'Pro', 'Scale')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 3. MEMBERSHIPS & ROLE-BASED ACCESS CONTROL (RBAC)
-- ==============================================================================
create table if not exists public.memberships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  org_id uuid references public.organizations(id) on delete cascade not null,
  role text default 'Member' not null check (role in ('Owner', 'Admin', 'Member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, org_id)
);

-- ==============================================================================
-- 4. PROJECTS
-- ==============================================================================
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  status text default 'Active' not null check (status in ('Active', 'Draft', 'Completed', 'Archived', 'active', 'paused', 'archived')),
  priority text default 'Medium' not null check (priority in ('Low', 'Medium', 'High', 'low', 'medium', 'high')),
  start_date timestamp with time zone,
  due_date timestamp with time zone,
  environment text default 'production' not null check (environment in ('production', 'staging', 'preview')),
  requests_count bigint default 0 not null,
  error_rate numeric(5, 2) default 0.00 not null,
  latency_ms integer default 35 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(org_id, slug)
);

-- Ensure columns exist if table was already present
alter table public.projects 
  add column if not exists priority text default 'Medium' not null check (priority in ('Low', 'Medium', 'High', 'low', 'medium', 'high')),
  add column if not exists start_date timestamp with time zone,
  add column if not exists due_date timestamp with time zone;

alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check
  check (status in ('Active', 'Draft', 'Completed', 'Archived', 'active', 'paused', 'archived'));

-- ==============================================================================
-- 5. TASKS
-- ==============================================================================
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  status text default 'Todo' not null check (status in ('Todo', 'In Progress', 'Done', 'todo', 'in_progress', 'done')),
  priority text default 'Medium' not null check (priority in ('Low', 'Medium', 'High', 'Urgent', 'low', 'medium', 'high', 'urgent')),
  assigned_to uuid references public.profiles(id) on delete set null,
  start_date timestamp with time zone,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 6. ACTIVITY RECORDS & AUDIT TRAILS
-- ==============================================================================
create table if not exists public.activity_records (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target text not null,
  category text not null check (category in ('deploy', 'api_key', 'billing', 'member', 'project', 'auth', 'task')),
  ip_address text,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 7. API KEYS
-- ==============================================================================
create table if not exists public.api_keys (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  status text default 'Active' not null check (status in ('Active', 'Revoked')),
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ==============================================================================
create index if not exists idx_projects_org_id on public.projects(org_id);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_priority on public.projects(priority);
create index if not exists idx_projects_due_date on public.projects(due_date);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_priority on public.tasks(priority);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_activity_org_created on public.activity_records(org_id, created_at desc);

-- ==============================================================================
-- 9. HELPER FUNCTIONS & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_records enable row level security;
alter table public.api_keys enable row level security;

-- Security Definer helper functions to avoid recursive RLS query loops
create or replace function public.is_org_member(check_org_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships
    where org_id = check_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(check_org_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships
    where org_id = check_org_id and user_id = auth.uid() and role in ('Owner', 'Admin')
  );
$$;

-- Drop existing policies if re-running to avoid conflicts
drop policy if exists "Users can view own and teammate profiles" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Members can view their organizations" on public.organizations;
drop policy if exists "Owners and Admins can update their organization" on public.organizations;
drop policy if exists "Members can view org memberships" on public.memberships;
drop policy if exists "Users can view own memberships" on public.memberships;
drop policy if exists "Owners and Admins can manage memberships" on public.memberships;
drop policy if exists "Members can view org projects" on public.projects;
drop policy if exists "Members can create org projects" on public.projects;
drop policy if exists "Members can update org projects" on public.projects;
drop policy if exists "Owners and Admins can delete org projects" on public.projects;
drop policy if exists "Members can view org tasks" on public.tasks;
drop policy if exists "Members can create org tasks" on public.tasks;
drop policy if exists "Members can update org tasks" on public.tasks;
drop policy if exists "Members can delete org tasks" on public.tasks;
drop policy if exists "Members can view org activities" on public.activity_records;
drop policy if exists "Members can view org api keys" on public.api_keys;

-- Profiles Policies
create policy "Users can view own and teammate profiles" on public.profiles
  for select using (
    auth.uid() = id or
    exists (
      select 1 from public.memberships m1
      join public.memberships m2 on m1.org_id = m2.org_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
  );

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Organizations Policies
create policy "Members can view their organizations" on public.organizations
  for select using (public.is_org_member(id));

create policy "Owners and Admins can update their organization" on public.organizations
  for update using (public.is_org_admin(id));

-- Memberships Policies (No self-recursion)
create policy "Users can view own memberships" on public.memberships
  for select using (user_id = auth.uid());

create policy "Owners and Admins can manage memberships" on public.memberships
  for all using (public.is_org_admin(org_id));

-- Projects Policies
create policy "Members can view org projects" on public.projects
  for select using (public.is_org_member(org_id));

create policy "Members can create org projects" on public.projects
  for insert with check (public.is_org_member(org_id));

create policy "Members can update org projects" on public.projects
  for update using (public.is_org_member(org_id));

create policy "Owners and Admins can delete org projects" on public.projects
  for delete using (public.is_org_admin(org_id));

-- Tasks Policies
create policy "Members can view org tasks" on public.tasks
  for select using (
    (org_id is not null and public.is_org_member(org_id)) or
    (project_id in (select id from public.projects where public.is_org_member(org_id)))
  );

create policy "Members can create org tasks" on public.tasks
  for insert with check (
    (org_id is not null and public.is_org_member(org_id)) or
    (project_id in (select id from public.projects where public.is_org_member(org_id)))
  );

create policy "Members can update org tasks" on public.tasks
  for update using (
    (org_id is not null and public.is_org_member(org_id)) or
    (project_id in (select id from public.projects where public.is_org_member(org_id)))
  );

create policy "Members can delete org tasks" on public.tasks
  for delete using (
    (org_id is not null and public.is_org_member(org_id)) or
    (project_id in (select id from public.projects where public.is_org_member(org_id)))
  );

-- Activity Records Policies
create policy "Members can view org activities" on public.activity_records
  for select using (public.is_org_member(org_id));

-- API Keys Policies
create policy "Members can view org api keys" on public.api_keys
  for select using (public.is_org_admin(org_id));

-- ==============================================================================
-- 10. AUTH TRIGGER (Auto profile & org creation on user sign up)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- 1. Insert Profile
  insert into public.profiles (id, full_name, email, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'Owner'
  );

  -- 2. Create Default Workspace for the new user
  insert into public.organizations (name, slug, plan)
  values (
    coalesce(new.raw_user_meta_data->>'full_name', 'Personal') || '''s Workspace',
    'ws-' || substr(md5(random()::text), 1, 8),
    'Pro'
  )
  returning id into new_org_id;

  -- 3. Assign Membership as Owner
  insert into public.memberships (user_id, org_id, role)
  values (new.id, new_org_id, 'Owner');

  return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
