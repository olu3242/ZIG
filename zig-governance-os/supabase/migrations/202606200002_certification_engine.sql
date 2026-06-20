-- Certification Eligibility Engine (Phase 11A). Per docs/academy/CERTIFICATION_MODEL.md,
-- eligibility itself is derived at read time from student_twins/user_progress/
-- capstone_projects (no new table needed for that). certification_journeys
-- (202606180008) is deliberately left untouched, per the same document and the prior
-- LEARNING_WORKFLOW_CERTIFICATION.md decision, since it is a separate, unrelated entity.
-- This migration adds only the one concrete persisted fact this phase introduces: a
-- point-in-time record that a learner was actually awarded a certification track, with
-- the requirement breakdown that justified it at that moment (so the award stays
-- explainable even if the learner's live scores later change).
create table if not exists certification_awards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learner_user_id uuid references users(id) on delete cascade,
  certification_key text not null,
  badge_key text not null,
  score_snapshot jsonb not null default '{}'::jsonb,
  awarded_at timestamptz not null default now(),
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['certification_awards']
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;
