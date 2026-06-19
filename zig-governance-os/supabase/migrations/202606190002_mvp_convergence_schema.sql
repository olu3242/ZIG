create extension if not exists pgcrypto;

create table if not exists organizations (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid references tenants(id) on delete cascade,
    name text not null,
    slug text not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists memberships (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    profile_id uuid references profiles(id) on delete cascade,
    role text not null default 'student',
    status text not null default 'active',
    created_at timestamptz not null default now(),
    unique (organization_id, profile_id)
);

create table if not exists lessons (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    learning_module_id uuid not null references learning_modules(id) on delete cascade,
    title text not null,
    content text not null,
    duration_minutes integer not null default 0,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists user_progress (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    learning_path_id uuid references learning_paths(id) on delete cascade,
    learning_module_id uuid references learning_modules(id) on delete cascade,
    lesson_id uuid references lessons(id) on delete cascade,
    status text not null default 'not_started',
    progress_percent integer not null default 0 check (progress_percent between 0 and 100),
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists labs (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    title text not null,
    scenario text not null,
    tasks jsonb not null default '[]'::jsonb,
    expected_deliverables jsonb not null default '[]'::jsonb,
    scoring_rubric jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists lab_sessions (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    lab_id uuid not null references labs(id) on delete cascade,
    user_id uuid references users(id) on delete set null,
    status text not null default 'in_progress',
    score integer not null default 0 check (score between 0 and 100),
    started_at timestamptz not null default now(),
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists lab_artifacts (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    lab_session_id uuid not null references lab_sessions(id) on delete cascade,
    title text not null,
    artifact_type text not null,
    content jsonb not null default '{}'::jsonb,
    status text not null default 'generated',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists vendors (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    category text not null,
    inherent_risk text not null default 'medium',
    assessment_status text not null default 'not_started',
    risk_rating integer not null default 0 check (risk_rating between 0 and 100),
    questionnaire jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (tenant_id, name)
);

create table if not exists ai_conversations (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    user_id uuid references users(id) on delete set null,
    coach_id text not null,
    title text not null,
    context jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists ai_messages (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    conversation_id uuid not null references ai_conversations(id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    created_at timestamptz not null default now()
);

create table if not exists audit_logs (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    actor_user_id uuid references users(id) on delete set null,
    action text not null,
    entity_type text not null,
    entity_id uuid,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_organizations_tenant_id on organizations(tenant_id);
create index if not exists idx_memberships_organization_id on memberships(organization_id);
create index if not exists idx_lessons_tenant_module on lessons(tenant_id, learning_module_id);
create index if not exists idx_user_progress_tenant_user on user_progress(tenant_id, user_id);
create index if not exists idx_labs_tenant_id on labs(tenant_id);
create index if not exists idx_lab_sessions_tenant_lab on lab_sessions(tenant_id, lab_id);
create index if not exists idx_lab_artifacts_tenant_session on lab_artifacts(tenant_id, lab_session_id);
create index if not exists idx_vendors_tenant_id on vendors(tenant_id);
create index if not exists idx_ai_conversations_tenant_user on ai_conversations(tenant_id, user_id);
create index if not exists idx_ai_messages_tenant_conversation on ai_messages(tenant_id, conversation_id);
create index if not exists idx_audit_logs_tenant_entity on audit_logs(tenant_id, entity_type, entity_id);

alter table organizations enable row level security;
alter table memberships enable row level security;
alter table lessons enable row level security;
alter table user_progress enable row level security;
alter table labs enable row level security;
alter table lab_sessions enable row level security;
alter table lab_artifacts enable row level security;
alter table vendors enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table audit_logs enable row level security;

drop policy if exists tenant_organizations_access on organizations;
create policy tenant_organizations_access on organizations using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
drop policy if exists tenant_memberships_access on memberships;
create policy tenant_memberships_access on memberships
    using (exists (select 1 from organizations where organizations.id = memberships.organization_id and organizations.tenant_id = current_tenant_id()))
    with check (exists (select 1 from organizations where organizations.id = memberships.organization_id and organizations.tenant_id = current_tenant_id()));
drop policy if exists tenant_lessons_access on lessons;
create policy tenant_lessons_access on lessons using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
drop policy if exists tenant_user_progress_access on user_progress;
create policy tenant_user_progress_access on user_progress using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
drop policy if exists tenant_labs_access on labs;
create policy tenant_labs_access on labs using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
drop policy if exists tenant_lab_sessions_access on lab_sessions;
create policy tenant_lab_sessions_access on lab_sessions using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
drop policy if exists tenant_lab_artifacts_access on lab_artifacts;
create policy tenant_lab_artifacts_access on lab_artifacts using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
drop policy if exists tenant_vendors_access on vendors;
create policy tenant_vendors_access on vendors using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
drop policy if exists tenant_ai_conversations_access on ai_conversations;
create policy tenant_ai_conversations_access on ai_conversations using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
drop policy if exists tenant_ai_messages_access on ai_messages;
create policy tenant_ai_messages_access on ai_messages using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
drop policy if exists tenant_audit_logs_access on audit_logs;
create policy tenant_audit_logs_access on audit_logs using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
