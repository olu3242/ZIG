# Learning OS Readiness Report

Generated: 2026-06-20

## End-To-End Path

Learning Path
↓
Module
↓
Lesson
↓
Assessment
↓
Simulation
↓
Artifact
↓
Portfolio

## Status

| Stage | App Route/Data | Database Object | Status |
| --- | --- | --- | --- |
| Learning Path | `/learning`, `/learning/[id]` | `learning_paths` | BLOCKED until migration applied |
| Module | `/learning/module/[id]` | `learning_modules`, `modules` view | BLOCKED until migration applied |
| Lesson | `/learning/lesson/[id]` | `lessons` | BLOCKED until migration applied |
| Assessment | `/assessment`, `/assessment/[id]` | `assessments`, `quizzes`, `quiz_questions`, `quiz_attempts` | PARTIAL; app route exists, live DB missing |
| Simulation | `/scenarios`, lab routes | `scenarios`, `scenario_runs`, compatibility views | BLOCKED until migration applied |
| Artifact | `/portfolio`, `/reports` | `artifacts`, `lab_artifacts`, `reports` | PARTIAL; app route exists, live DB missing |
| Portfolio | `/portfolio` | `artifacts` | BLOCKED until migration applied |

## Evidence

The current production/web app uses local MVP data for many UI pages, so pages can render. However, the configured Supabase project has no MVP runtime tables exposed through REST. Persistence, progress tracking, attempts, and generated artifacts cannot be certified until the recovery migration is applied and verified.

## Readiness Score

- UI route readiness: 85%
- Database readiness before recovery migration: 0%
- Database readiness after recovery migration applied and verifier passes: target 80%
- E2E persistence readiness after wiring UI writes to services: target 65%

## Required Next Step

Apply `supabase/migrations/ZZZ_mvp_core_platform_recovery.sql`, seed `supabase/seed/mvp_seed.sql`, then run `scripts/verify-mvp-schema.ts`.
