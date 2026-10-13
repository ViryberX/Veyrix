-- ==============================================================================
-- Veyrix SaaS Migration: Projects & Tasks Enhancements
-- Adds Priority, Start/Due Dates, and expanded status enums
-- ==============================================================================

-- 1. Update Projects table
alter table public.projects
  add column if not exists priority text default 'Medium' not null check (priority in ('Low', 'Medium', 'High', 'low', 'medium', 'high')),
  add column if not exists start_date timestamp with time zone,
  add column if not exists due_date timestamp with time zone;

-- Update status check constraint on projects to allow Active, Draft, Completed, Archived
alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check
  check (status in ('Active', 'Draft', 'Completed', 'Archived', 'active', 'paused', 'archived'));

-- 2. Update Tasks table
alter table public.tasks
  alter column project_id drop not null; -- Allow standalone tasks or project-associated tasks

alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks add constraint tasks_status_check
  check (status in ('Todo', 'In Progress', 'Done', 'todo', 'in_progress', 'done'));

alter table public.tasks drop constraint if exists tasks_priority_check;
alter table public.tasks add constraint tasks_priority_check
  check (priority in ('Low', 'Medium', 'High', 'Urgent', 'low', 'medium', 'high', 'urgent'));

alter table public.tasks
  add column if not exists start_date timestamp with time zone,
  add column if not exists org_id uuid references public.organizations(id) on delete cascade;

-- Indexing for fast search and filtering
create index if not exists idx_projects_priority on public.projects(priority);
create index if not exists idx_projects_due_date on public.projects(due_date);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_priority on public.tasks(priority);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
