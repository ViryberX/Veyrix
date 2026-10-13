-- ==============================================================================
-- Veyrix Database Schema & Row-Level Security (RLS)
-- Brand: Veyrix — "Build beyond limits."
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ORGANIZATIONS / WORKSPACES TABLE
create table if not exists public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  plan text default 'Starter' not null check (plan in ('Starter', 'Pro', 'Scale')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. MEMBERSHIPS TABLE
create table if not exists public.memberships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  org_id uuid references public.organizations(id) on delete cascade not null,
  role text default 'Member' not null check (role in ('Owner', 'Admin', 'Member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, org_id)
);

-- 4. PROJECTS TABLE
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
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

-- 5. ACTIVITY LOGS TABLE
create table if not exists public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. API KEYS TABLE
create table if not exists public.api_keys (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  status text default 'Active' not null check (status in ('Active', 'Revoked')),
  last_used timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.activity_logs enable row level security;
alter table public.api_keys enable row level security;

-- Profiles: Users can read and update their own record
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Organizations: Accessible by workspace members
create policy "Members can view their organizations" on public.organizations
  for select using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = organizations.id
      and memberships.user_id = auth.uid()
    )
  );

-- Projects: Accessible only by users belonging to that organization
create policy "Members can view org projects" on public.projects
  for select using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = projects.org_id
      and memberships.user_id = auth.uid()
    )
  );

create policy "Admins and Owners can insert org projects" on public.projects
  for insert with check (
    exists (
      select 1 from public.memberships
      where memberships.org_id = projects.org_id
      and memberships.user_id = auth.uid()
      and memberships.role in ('Owner', 'Admin')
    )
  );

create policy "Admins and Owners can update org projects" on public.projects
  for update using (
    exists (
      select 1 from public.memberships
      where memberships.org_id = projects.org_id
      and memberships.user_id = auth.uid()
      and memberships.role in ('Owner', 'Admin')
    )
  );

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Veyrix Engineer'),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
