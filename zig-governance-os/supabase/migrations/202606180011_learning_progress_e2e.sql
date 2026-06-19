-- Learning workflow E2E closure: enrollment + lesson completion progress tracking.

create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  learning_path_id uuid not null references learning_paths(id) on delete cascade,
  module_id uuid references learning_modules(id) on delete cascade,
  lesson_id uuid references learning_modules(id) on delete cascade,
  status text not null default 'enrolled' check (status in ('enrolled', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on user_progress (tenant_id, user_id, learning_path_id);
create index on user_progress (tenant_id, lesson_id);

alter table user_progress enable row level security;

drop policy if exists user_progress_tenant_access on user_progress;
create policy user_progress_tenant_access on user_progress
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

drop trigger if exists set_user_progress_updated_at on user_progress;
create trigger set_user_progress_updated_at before update on user_progress for each row execute function set_updated_at();
