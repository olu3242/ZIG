# Zig MVP Dependency Map

Status date: 2026-06-20

## Core Dependency Chain

```text
Organizations
  -> Projects
     -> Assets
        -> Controls
           -> Asset-Control Mappings
              -> Risks
                 -> Framework Requirements
                    -> Control-Framework Mappings
                       -> Readiness
                          -> Gap Findings
                             -> Recommendations
                                -> Tasks
                                   -> Score Improvement
                                      -> Reports
```

## Stage Dependency Rules

| Stage | Depends On | Unlock Condition |
| --- | --- | --- |
| CREATE | Foundation | Auth/org/membership usable |
| ASSESS | CREATE | CREATE certification PASS |
| IMPROVE | ASSESS | ASSESS certification PASS |
| REPORT | IMPROVE | IMPROVE certification PASS |

## Prohibited Dependency Violations

Do not build:

- Risks before CREATE PASS.
- Readiness before risks and framework mappings.
- Recommendations before gaps/readiness/risk signals.
- Tasks before recommendations or source findings.
- Reports before lifecycle data exists.
- AI Governance before deterministic lifecycle workflows pass.

## Current Bottleneck

```text
CREATE certification evidence
```

Everything downstream is blocked until CREATE passes.

## Prepared Locked Packages

| Package | Status | Implementation Gate |
| --- | --- | --- |
| `docs/architecture/ASSESS_FOUNDATION_ARCHITECTURE.md` | Architecture ready | `CREATE = PASS` |
| `docs/program/ASSESS_BUILD_READINESS.md` | Build-ready design PASS | Implementation locked |
