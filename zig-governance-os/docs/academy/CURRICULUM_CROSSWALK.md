# Curriculum Crosswalk — Source B Modules × Source C Tracks × Schema

> Maps each of the 10 Source B curriculum modules to the Source C Academy Tracks it
> belongs to, and to the real (or minimally-extended) schema rows that would carry it.
> No table in this document is new; one optional column is proposed in Section 3.

## 1. Crosswalk table

| Source B Curriculum Module | Source C Academy Track(s) | `learning_paths` row (proposed) | `learning_modules` content shape | Relevant `lab_artifacts.artifact_type` |
|---|---|---|---|---|
| GRC Foundations | Governance | "GRC Foundations" | lessons only (intro/foundational; no lab tasks needed) | — |
| Asset Management | Governance, Security Governance | "Asset Management" | lessons + 1-2 lab modules | `gap_assessment` (asset inventory gaps) |
| Risk Management | Risk | "Risk Management" | lessons + lab modules | `risk_register` (existing check-constraint value) |
| Control Management | Compliance, Security Governance | "Control Management" | lessons + lab modules | `gap_assessment` |
| Evidence Management | Compliance, Audit | "Evidence Management" | lessons + lab modules | `evidence_record` (existing check-constraint value) |
| Framework Intelligence | Governance, Compliance | "Framework Intelligence" | lessons; uses `scenarios.framework_ids uuid[]` to tag which frameworks (ISO 27001, SOC2, NIST CSF, etc.) a given scenario exercises | — |
| Audit & Assessments | Audit | "Audit & Assessments" | lessons + `learning_assessments` rows + lab modules | `audit_finding` (existing check-constraint value) |
| Third-Party & Vendor Risk | Vendor Risk | "Third-Party & Vendor Risk" | lessons + lab modules | `vendor_review` (existing check-constraint value) |
| AI Governance | Governance, Security Governance | "AI Governance" | lessons (content area; not to be confused with the AI Coach feature itself, see `AI_COACH_ARCHITECTURE.md`) | — |
| GRC Capstone | Executive Leadership (capstone spans all tracks) | uses existing but unwired `capstone_projects` table (`202606180007_learning_os_e2e.sql` lines 96-107: `learner_user_id`, `title`, `status`, `portfolio_score`) rather than a `learning_paths` row | capstone is a culminating project, not a sequential lesson path | all five artifact types may apply across a capstone's component tasks |

Two Source C tracks — **BCM/DR** and **Executive Leadership** (outside the capstone) — have
**no corresponding Source B curriculum module**. This is a real content gap, not a schema
gap: nothing prevents creating "Business Continuity & Disaster Recovery" and "Executive
Leadership" as additional `learning_paths` rows using the exact same shape as the 10 above;
they simply were not named in the Source B list. Flagged here so the gap is visible rather
than silently absorbed into "Governance."

## 2. Why no new table is needed

Every Source B module maps onto the existing `learning_paths` → `learning_modules` shape
(verified schema: `202606180001_batch_21_core_data_platform.sql` lines 240-259). The
variation between curriculum modules is in *content rows*, not *schema*. Lab content for
each module reuses the existing `lab_artifacts.artifact_type` check constraint
(`risk_register`, `audit_finding`, `gap_assessment`, `evidence_record`, `vendor_review` —
`supabase/migrations/202606180013_lab_workflow_e2e.sql` lines 64-77), which already
happens to cover 5 of the 10 modules' natural lab output almost one-to-one. This is strong
evidence the schema was designed with this curriculum shape in mind, even though no seed
data exists yet.

## 3. The one proposed schema addition: `learning_paths.track`

Today `learning_paths` has no column distinguishing "this is a Source B curriculum module"
from "this is a Source C named career path" from "this is a Source C academy track
container." All three are presently indistinguishable rows of the same shape.

**Proposed (not built):** add a nullable `track text` column to `learning_paths` —
values would be one of the 8 Source C Academy Track names (Governance, Risk, Compliance,
Audit, Vendor Risk, Security Governance, BCM/DR, Executive Leadership), or null for rows
that represent a cross-track career path rather than a single-track curriculum module.
This is the minimal addition: a single nullable text column, not a new table, not a new
enum type (to avoid a migration-time constraint on a list that may grow).

**Also proposed (not built), addressed fully in `ZIG_LEARNING_OS_MASTER_BLUEPRINT.md`
Section 4:** a `learning_path_modules` join table, needed only if a single curriculum
module (e.g. "Risk Management") must be referenced by multiple career paths (e.g. both
"Risk Manager" and "GRC Analyst") without duplicating `learning_modules` rows. Today
`learning_modules.learning_path_id` is a single FK, so a module belongs to exactly one
path. `CAREER_PATH_CROSSWALK.md` Section 3 shows where this limitation actually bites.
