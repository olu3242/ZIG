-- ZIG MVP Onboarding Experience
-- Scope: profile setup, experience selection, framework interests,
-- career goals, onboarding progress, and starter learning assignment.

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists user_persona text;
alter table public.profiles add column if not exists framework_interests jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists career_goals jsonb not null default '[]'::jsonb;

create table if not exists public.onboarding_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_complete boolean not null default false,
  organization_complete boolean not null default false,
  role_complete boolean not null default false,
  frameworks_selected boolean not null default false,
  goals_selected boolean not null default false,
  learning_path_assigned boolean not null default false,
  completed boolean not null default false,
  current_step text not null default 'profile',
  updated_at timestamptz not null default now()
);

create table if not exists public.user_learning_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  assigned_path text not null,
  current_module text not null default 'Orientation',
  framework_recommendations jsonb not null default '[]'::jsonb,
  lab_recommendations jsonb not null default '[]'::jsonb,
  certification_recommendations jsonb not null default '[]'::jsonb,
  career_roadmap jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.onboarding_progress enable row level security;
alter table public.user_learning_profiles enable row level security;

drop policy if exists onboarding_progress_self_select on public.onboarding_progress;
create policy onboarding_progress_self_select on public.onboarding_progress
for select
using (user_id = auth.uid());

drop policy if exists onboarding_progress_self_update on public.onboarding_progress;
create policy onboarding_progress_self_update on public.onboarding_progress
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists user_learning_profiles_self_select on public.user_learning_profiles;
create policy user_learning_profiles_self_select on public.user_learning_profiles
for select
using (user_id = auth.uid());

drop trigger if exists set_onboarding_progress_updated_at on public.onboarding_progress;
create trigger set_onboarding_progress_updated_at
before update on public.onboarding_progress
for each row execute function public.set_updated_at();

drop trigger if exists set_user_learning_profiles_updated_at on public.user_learning_profiles;
create trigger set_user_learning_profiles_updated_at
before update on public.user_learning_profiles
for each row execute function public.set_updated_at();
