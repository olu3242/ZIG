# Learning Integrity Report

Scope: `docs/learning/MASTER_CURRICULUM_MAP.md`, `docs/learning/lessons/**`,
`docs/learning/labs/**`, `supabase/seed/002_learning_content_wave_1.sql`,
`packages/services/src/LearningService.ts`, and the `apps/web/app/learning/**` routes.

## Findings

### 1. Eight of nine curriculum tracks are fully written but have zero seeded rows (High)
`docs/learning/MASTER_CURRICULUM_MAP.md`'s status table lists 9 tracks. Only "ISO 27001 /
SOC 2 / NIST CSF" is marked **Seeded**, backed by the real
`supabase/seed/002_learning_content_wave_1.sql` (39 lines, 3 `learning_paths` rows with
fixed UUIDs, confirmed read in full). The other eight — Governance, Risk, Compliance,
Audit, Vendor Risk, Security Governance, BCM/DR, Executive Leadership — are each marked
"Documented, not seeded." This is confirmed structurally: `find docs/learning/lessons
-maxdepth 1 -type d` shows 8 per-track lesson directories (`vendor_risk`,
`security_governance`, `governance`, `risk`, `compliance`, `audit`, `bcm_dr`,
`executive_leadership`), each with 5 lesson files (41 total lesson markdown files), plus
one lab spec per track in `docs/learning/labs/` (8 lab files: e.g.
`COMPLIANCE_LAB_ISO27001_GAP_ASSESSMENT.md`, `RISK_LAB_CREATE_ENTERPRISE_RISK_REGISTER.md`).
None of these 41 lessons or 8 labs has a corresponding row in any `supabase/seed/*.sql`
file — a `grep` for the lesson/lab titles against `supabase/seed/` returns no hits. The
curriculum is, today, pure documentation with no database-backed presence.

### 2. The curriculum map names three services that do not exist in the codebase (High)
`MASTER_CURRICULUM_MAP.md`'s "Why these eight tracks" table attributes backing services
to each track, including `ComplianceStatusService`, `FrameworkMappingService`, and
`FrameworkRoadmapService` for the Compliance and Security Governance tracks. A
repository-wide search (`grep -rln` across `packages/` and `apps/`) finds these three
names only inside `apps/web/.next/cache/.tsbuildinfo` — a stale Next.js build-cache
artifact, not real source. None of the 12 real services enumerated in
`SERVICE_CONTRACT_REPORT.md` (`packages/services/src/factory.ts`'s `ZigServices`
interface) include any of these three. The curriculum map is documenting a service layer
that has not been built, which means even if rows were seeded for these tracks today, the
"Compliance" and "Security Governance" track pages would have no service to call to
render real status/mapping/roadmap data — only `FrameworkService` (generic CRUD) and
`ControlService` (15-line pass-through) exist.

### 3. Scenario-to-track pairing depends on the disconnected scenario subsystem (Medium, cross-ref)
The curriculum map's "Track → Scenario pairing" section ties every track's final-module
exercise to one of the five `docs/scenarios/*.md` simulated companies (CloudPay,
HealthBridge, RetailNova, ManufacturX, GovSec). Per `SCENARIO_INTEGRITY_REPORT.md`, none
of these five scenarios has a seeded row in either candidate table family
(`scenarios`/`scenario_runs` or `simulated_companies`/`simulated_company_objects`), and
the live `/scenarios` page is fully static and disconnected from both. This means even
the one track that does have seeded learning-path content (Wave 1: ISO 27001/SOC2/NIST)
cannot yet deliver the scenario-anchored final exercise the curriculum design calls for,
because the scenario side of the pairing has no data.

### 4. LearningService is a 15-line pass-through, no curriculum-specific logic (Medium)
`packages/services/src/LearningService.ts` (15 lines, confirmed in wave-2 read) extends
`BaseService<LearningRecord>` with no overrides — generic CRUD only (`create`, `update`,
`delete`, `findById`, `findMany`, `search`). There is no method for "get track
completion," "get next lesson," or "score a lab submission," despite the curriculum
map's lesson → lab → exercise sequencing model. Any such logic, if it exists, would have
to live entirely in `apps/web` route handlers rather than the service layer — and a grep
of `getZigServices().` call sites (per `SERVICE_DEPENDENCY_MAP.md`) shows the learning
service is never actually invoked from `apps/web` at all today (only `audit` and
`frameworks` are called).

### 5. Known schema gaps are self-documented, not hidden (Informational)
The curriculum map's final section, "What is explicitly not covered by this map,"
explicitly states there is no quiz question bank and no lesson body-text field in the
schema. This is a transparent admission rather than a defect this audit discovered — it
is recorded here because it confirms the schema cannot currently store full lesson
content even if seeding were attempted today; seeding would require a schema migration
first, not just an INSERT script.

## Severity Table

| Finding | Severity |
|---|---|
| 8/9 tracks fully documented but zero seeded learning_paths rows | High |
| Curriculum map cites 3 nonexistent services | High |
| Track-ending exercises depend on unseeded, disconnected scenario data | Medium |
| LearningService has no curriculum-specific methods and is never called from apps/web | Medium |
| Self-documented schema gaps (no quiz bank, no lesson body field) | Informational |

## Recommendation

Treat `ComplianceStatusService`, `FrameworkMappingService`, and `FrameworkRoadmapService`
as a documented backlog, not implemented infrastructure — either build them before
seeding the Compliance/Security Governance tracks, or revise the curriculum map to point
at services that actually exist. Seed Wave 2 (the eight pending tracks) only after
deciding the lesson-body-field and quiz-bank schema gaps, since seeding without that
schema work will produce learning_paths rows with nowhere to put the lesson content
described in the 41 lesson docs. Resolve the scenario-data gap (see
`SCENARIO_INTEGRITY_REPORT.md`) before relying on scenario-anchored final exercises in
any newly seeded track.
