-- Learning OS content, Wave 1: real learning paths and modules for the demo tenant.
-- Additive only — no schema changes. Safe to re-run (fixed ids, on conflict do nothing).
-- See docs/curriculum/LEARNING_CONTENT_WAVE_1.md for the content spec.

select set_config('app.current_tenant_id', '00000000-0000-4000-8000-000000000001', false);

insert into learning_paths (id, tenant_id, title, description, progress_percent)
values
  ('00000000-0000-4000-8000-000000000201', current_tenant_id(), 'ISO 27001 — Information Security Management Foundations',
   'Build and operate an ISMS aligned to ISO/IEC 27001:2022, from scope and risk assessment through Annex A control mapping and internal audit.', 0),
  ('00000000-0000-4000-8000-000000000202', current_tenant_id(), 'SOC 2 — Trust Services Criteria in Practice',
   'Design controls and evidence programs against the AICPA Trust Services Criteria and prepare for a Type II audit.', 0),
  ('00000000-0000-4000-8000-000000000203', current_tenant_id(), 'NIST CSF 2.0 — Cybersecurity Outcomes for Governance Programs',
   'Apply the six NIST Cybersecurity Framework functions to build current and target profiles and prioritize remediation.', 0)
on conflict (id) do nothing;

insert into learning_modules (id, tenant_id, learning_path_id, title, module_type, duration_minutes)
values
  -- ISO 27001
  ('00000000-0000-4000-8000-000000000211', current_tenant_id(), '00000000-0000-4000-8000-000000000201', 'ISMS Scope, Context, and Leadership (Clauses 4-5)', 'lesson', 35),
  ('00000000-0000-4000-8000-000000000212', current_tenant_id(), '00000000-0000-4000-8000-000000000201', 'Risk Assessment and Statement of Applicability', 'lesson', 40),
  ('00000000-0000-4000-8000-000000000213', current_tenant_id(), '00000000-0000-4000-8000-000000000201', 'Mapping Annex A Controls to Real Assets', 'lab', 60),
  ('00000000-0000-4000-8000-000000000214', current_tenant_id(), '00000000-0000-4000-8000-000000000201', 'Internal Audit Program Design', 'lesson', 30),
  ('00000000-0000-4000-8000-000000000215', current_tenant_id(), '00000000-0000-4000-8000-000000000201', 'Build a Statement of Applicability for a Sample Org', 'exercise', 50),

  -- SOC 2
  ('00000000-0000-4000-8000-000000000221', current_tenant_id(), '00000000-0000-4000-8000-000000000202', 'The Five Trust Services Criteria', 'lesson', 25),
  ('00000000-0000-4000-8000-000000000222', current_tenant_id(), '00000000-0000-4000-8000-000000000202', 'Designing Controls for the Security Criterion', 'lesson', 35),
  ('00000000-0000-4000-8000-000000000223', current_tenant_id(), '00000000-0000-4000-8000-000000000202', 'Evidence Collection for a Type II Audit', 'lab', 55),
  ('00000000-0000-4000-8000-000000000224', current_tenant_id(), '00000000-0000-4000-8000-000000000202', 'Common Auditor Exceptions and How to Prevent Them', 'lesson', 30),
  ('00000000-0000-4000-8000-000000000225', current_tenant_id(), '00000000-0000-4000-8000-000000000202', 'Draft a Readiness Assessment for a SaaS Company', 'exercise', 45),

  -- NIST CSF 2.0
  ('00000000-0000-4000-8000-000000000231', current_tenant_id(), '00000000-0000-4000-8000-000000000203', 'The Six CSF Functions: Govern, Identify, Protect, Detect, Respond, Recover', 'lesson', 30),
  ('00000000-0000-4000-8000-000000000232', current_tenant_id(), '00000000-0000-4000-8000-000000000203', 'Building a Current Profile vs. Target Profile', 'lab', 50),
  ('00000000-0000-4000-8000-000000000233', current_tenant_id(), '00000000-0000-4000-8000-000000000203', 'Prioritizing Gaps by Risk and Cost', 'lesson', 30),
  ('00000000-0000-4000-8000-000000000234', current_tenant_id(), '00000000-0000-4000-8000-000000000203', 'Tier Selection and Maturity Scoring', 'lesson', 25),
  ('00000000-0000-4000-8000-000000000235', current_tenant_id(), '00000000-0000-4000-8000-000000000203', 'Produce a Target Profile Roadmap for a Mid-Size Org', 'exercise', 50)
on conflict (id) do nothing;
