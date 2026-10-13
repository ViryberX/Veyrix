-- ==============================================================================
-- Veyrix SaaS Production Schema Migration
-- Backend: Supabase PostgreSQL & Supabase Auth
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
-- 4. PROJECTS & MICROSERVICES
-- ==============================================================================
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  status text default 'active' not null check (status in ('active', 'paused', 'archived')),
  environment text default 'production' not null check (environment in ('production', 'staging', 'preview')),
  requests_count bigint default 0 not null,
  error_rate numeric(5, 2) default 0.00 not null,
  latency_ms integer default 35 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(org_id, slug)
);

-- ==============================================================================
-- 5. PROJECT TASKS & WORKFLOWS
-- ==============================================================================
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' not null check (status in ('todo', 'in_progress', 'done')),
  priority text default 'medium' not null check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid references public.profiles(id) on delete set null,
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
  category text not null check (category in ('deploy', 'api_key', 'billing', 'member', 'project', 'auth')),
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
-- INDEXES FOR QUERY ACCELERATION
-- ==============================================================================
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_memberships_user_org on public.memberships(user_id, org_id);
create index if not exists idx_projects_org_status on public.projects(org_id, status);
create index if not exists idx_tasks_project_status on public.tasks(project_id, status);
create index if not exists idx_activity_org_created on public.activity_records(org_id, created_at desc);
create index if not exists idx_api_keys_org on public.api_keys(org_id, status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_records enable row level security;
alter table public.api_keys enable row level security;

-- Profiles: Users can view their own profile and profiles of peers in shared orgs
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

-- Organizations: Only accessible by users belonging to that organization
create policy "Members can view their organizations" on public.organizations
  for select using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = organizations.id
      and memberships.user_id = auth.uid()
    )
  );

create policy "Owners and Admins can update their organization" on public.organizations
  for update using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = organizations.id
      and memberships.user_id = auth.uid()
      and memberships.role in ('Owner', 'Admin')
    )
  );

-- Memberships: Members can view who else is in their organizations
create policy "Members can view org memberships" on public.memberships
  for select using (
    exists (
      select 1 from public.memberships m
      where m.org_id = memberships.org_id
      and m.user_id = auth.uid()
    )
  );

create policy "Owners and Admins can manage memberships" on public.memberships
  for all using (
    exists (
      select 1 from public.memberships m
      where m.org_id = memberships.org_id
      and m.user_id = auth.uid()
      and m.role in ('Owner', 'Admin')
    )
  );

-- Projects: Isolated per organization
create policy "Members can view org projects" on public.projects
  for select using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = projects.org_id
      and memberships.user_id = auth.uid()
    )
  );

create policy "Members can create org projects" on public.projects
  for insert with check (
    exists (
      select 1 from public.memberships
      where memberships.org_id = projects.org_id
      and memberships.user_id = auth.uid()
    )
  );

create policy "Members can update org projects" on public.projects
  for update using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = projects.org_id
      and memberships.user_id = auth.uid()
    )
  );

create policy "Owners and Admins can delete org projects" on public.projects
  for delete using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = projects.org_id
      and memberships.user_id = auth.uid()
      and memberships.role in ('Owner', 'Admin')
    )
  );

-- Tasks: Protected by project parent org membership
create policy "Members can view project tasks" on public.tasks
  for select using (
    exists (
      select 1 from public.projects
      join public.memberships on memberships.org_id = projects.org_id
      where projects.id = tasks.project_id
      and memberships.user_id = auth.uid()
    )
  );

create policy "Members can create and update tasks" on public.tasks
  for all using (
    exists (
      select 1 from public.projects
      join public.memberships on memberships.org_id = projects.org_id
      where projects.id = tasks.project_id
      and memberships.user_id = auth.uid()
    )
  );

-- Activity records: Viewable only by organization members
create policy "Members can view org activity records" on public.activity_records
  for select using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = activity_records.org_id
      and memberships.user_id = auth.uid()
    )
  );

create policy "System and members can insert activity records" on public.activity_records
  for insert with check (
    exists (
      select 1 from public.memberships
      where memberships.org_id = activity_records.org_id
      and memberships.user_id = auth.uid()
    )
  );

-- API Keys: Viewable and manageable only by Owner and Admin
create policy "Admins and Owners can view org API keys" on public.api_keys
  for select using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = api_keys.org_id
      and memberships.user_id = auth.uid()
      and memberships.role in ('Owner', 'Admin')
    )
  );

create policy "Admins and Owners can manage org API keys" on public.api_keys
  for all using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = api_keys.org_id
      and memberships.user_id = auth.uid()
      and memberships.role in ('Owner', 'Admin')
    )
  );

-- ==============================================================================
-- AUTOMATIC PROFILE & DEFAULT WORKSPACE TRIGGER
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
  user_name text;
begin
  user_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  -- 1. Create Profile
  insert into public.profiles (id, full_name, email, avatar_url, role)
  values (
    new.id,
    user_name,
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'Owner'
  );

  -- 2. Create Default Workspace
  insert into public.organizations (name, slug, plan)
  values (
    user_name || '''s Workspace',
    lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substring(new.id::text, 1, 6),
    'Starter'
  )
  returning id into new_org_id;

  -- 3. Add User as Owner in Memberships
  insert into public.memberships (user_id, org_id, role)
  values (new.id, new_org_id, 'Owner');

  -- 4. Record Initial Activity
  insert into public.activity_records (org_id, user_id, action, target, category)
  values (new_org_id, new.id, 'created workspace', 'Initial setup', 'auth');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at timestamp trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();
