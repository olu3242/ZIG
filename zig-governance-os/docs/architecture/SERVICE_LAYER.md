# Service Layer

## Purpose

The Batch 21 service layer is the module-facing API over the tenant-scoped repository layer. It keeps app routes and future engines from coupling directly to persistence details.

Package:

```text
packages/services
```

## Services

Batch 21 creates:

- `FrameworkService`
- `ProjectService`
- `AssetService`
- `RiskService`
- `ControlService`
- `EvidenceService`
- `LearningService`
- `ScenarioService`
- `GovernanceService`

## Base Capabilities

All services inherit:

- `create()`
- `update()`
- `delete()`
- `findById()`
- `findMany()`
- `search()`

Every method requires `TenantContext`, preserving tenant isolation at the service boundary.

## Domain Extensions

Some services expose relationship-aware helpers:

- `RiskService.findAssessments()`
- `ControlService.findMappings()`
- `EvidenceService.findByControl()`
- `LearningService.findModules()`
- `ScenarioService.findRuns()`
- `GovernanceService.findRecommendations()`

These helpers are intentionally narrow. Batch 23 will add the full Governance Graph and traceability engine.

## Service Factory

`createServices(repositories)` returns a complete service registry from a `ZigRepositories` instance.

This allows future app/server code to assemble services from:

- in-memory repositories for tests
- Supabase repositories for production
- seeded repositories for demos

## Tests

Compile-time service smoke tests live in:

```text
packages/services/src/tests/service-layer.test.ts
```

The test asserts the service layer preserves tenant context when creating and reading records.

## Open Issues

- Add transaction support when multi-record workflows arrive in Project Builder and Governance Graph.
- Add authorization checks after Batch 22 wires real sessions and role assignments.
- Add runtime tests once the repo standardizes test execution.
