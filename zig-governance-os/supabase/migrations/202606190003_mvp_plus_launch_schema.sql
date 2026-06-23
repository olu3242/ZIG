create table if not exists quizzes (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    title text not null,
    framework text not null,
    passing_score integer not null default 80,
    created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    quiz_id uuid not null references quizzes(id) on delete cascade,
    question_type text not null check (question_type in ('multiple_choice','multi_select','scenario')),
    prompt text not null,
    options jsonb not null default '[]'::jsonb,
    correct_answers jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists quiz_attempts (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    quiz_id uuid not null references quizzes(id) on delete cascade,
    user_id uuid references users(id) on delete set null,
    score integer not null check (score between 0 and 100),
    passed boolean not null default false,
    completed_at timestamptz not null default now()
);

create table if not exists badges (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid references tenants(id) on delete cascade,
    name text not null,
    criteria text not null,
    created_at timestamptz not null default now()
);

create table if not exists user_badges (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    badge_id uuid not null references badges(id) on delete cascade,
    awarded_at timestamptz not null default now()
);

alter table lab_sessions add column if not exists rubric_score integer default 0 check (rubric_score between 0 and 100);
alter table lab_sessions add column if not exists feedback text;
alter table lab_sessions add column if not exists coach_comments text;

create table if not exists certifications (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid references tenants(id) on delete cascade,
    name text not null,
    requirements jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists user_certifications (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    certification_id uuid not null references certifications(id) on delete cascade,
    status text not null default 'eligible',
    certificate_uri text,
    issued_at timestamptz
);

create table if not exists reports (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    report_type text not null,
    title text not null,
    export_formats text[] not null default array['pdf'],
    payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists xp_events (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    source_type text not null,
    source_id uuid,
    xp integer not null,
    created_at timestamptz not null default now()
);

create table if not exists user_xp (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    total_xp integer not null default 0,
    level integer not null default 1 check (level between 1 and 100),
    updated_at timestamptz not null default now(),
    unique (tenant_id, user_id)
);

create table if not exists achievements (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid references tenants(id) on delete cascade,
    name text not null,
    criteria text not null,
    xp_reward integer not null default 0
);

create table if not exists user_achievements (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    achievement_id uuid not null references achievements(id) on delete cascade,
    awarded_at timestamptz not null default now()
);

create table if not exists virtual_organizations (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid references tenants(id) on delete cascade,
    name text not null,
    industry text not null,
    profile jsonb not null default '{}'::jsonb
);

create table if not exists scenario_templates (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid references tenants(id) on delete cascade,
    industry text not null,
    title text not null,
    scenario jsonb not null default '{}'::jsonb
);

create table if not exists scenario_instances (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    template_id uuid references scenario_templates(id) on delete set null,
    virtual_organization_id uuid references virtual_organizations(id) on delete set null,
    status text not null default 'active',
    created_at timestamptz not null default now()
);

create index if not exists idx_quizzes_tenant on quizzes(tenant_id);
create index if not exists idx_quiz_questions_tenant_quiz on quiz_questions(tenant_id, quiz_id);
create index if not exists idx_quiz_attempts_tenant_user on quiz_attempts(tenant_id, user_id);
create index if not exists idx_badges_tenant on badges(tenant_id);
create index if not exists idx_user_badges_tenant_user on user_badges(tenant_id, user_id);
create index if not exists idx_certifications_tenant on certifications(tenant_id);
create index if not exists idx_reports_tenant on reports(tenant_id, report_type);
create index if not exists idx_xp_events_tenant_user on xp_events(tenant_id, user_id);
create index if not exists idx_achievements_tenant on achievements(tenant_id);
create index if not exists idx_virtual_orgs_tenant on virtual_organizations(tenant_id);
create index if not exists idx_scenario_templates_tenant on scenario_templates(tenant_id, industry);
create index if not exists idx_scenario_instances_tenant on scenario_instances(tenant_id, status);

alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;
alter table certifications enable row level security;
alter table user_certifications enable row level security;
alter table reports enable row level security;
alter table xp_events enable row level security;
alter table user_xp enable row level security;
alter table achievements enable row level security;
alter table user_achievements enable row level security;
alter table virtual_organizations enable row level security;
alter table scenario_templates enable row level security;
alter table scenario_instances enable row level security;

create policy tenant_quizzes_access on quizzes using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_quiz_questions_access on quiz_questions using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_quiz_attempts_access on quiz_attempts using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_badges_access on badges using (tenant_id = current_tenant_id() or tenant_id is null) with check (tenant_id = current_tenant_id() or tenant_id is null);
create policy tenant_user_badges_access on user_badges using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_certifications_access on certifications using (tenant_id = current_tenant_id() or tenant_id is null) with check (tenant_id = current_tenant_id() or tenant_id is null);
create policy tenant_user_certifications_access on user_certifications using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_reports_access on reports using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_xp_events_access on xp_events using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_user_xp_access on user_xp using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_achievements_access on achievements using (tenant_id = current_tenant_id() or tenant_id is null) with check (tenant_id = current_tenant_id() or tenant_id is null);
create policy tenant_user_achievements_access on user_achievements using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_virtual_orgs_access on virtual_organizations using (tenant_id = current_tenant_id() or tenant_id is null) with check (tenant_id = current_tenant_id() or tenant_id is null);
create policy tenant_scenario_templates_launch_access on scenario_templates using (tenant_id = current_tenant_id() or tenant_id is null) with check (tenant_id = current_tenant_id() or tenant_id is null);
create policy tenant_scenario_instances_launch_access on scenario_instances using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
