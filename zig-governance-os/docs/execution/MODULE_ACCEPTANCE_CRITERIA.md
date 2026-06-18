# Module Acceptance Criteria

## Universal Criteria

Every Zig module must:

- Preserve tenant isolation.
- Connect to the Governance Graph.
- Avoid orphan records.
- Support the Create -> Analyze -> Recommend -> Act -> Measure -> Report loop.
- Provide non-empty screens.
- Use strict TypeScript.
- Produce auditable changes.
- Include implementation documentation.

## Data Criteria

- Records include `tenantId`.
- Project-scoped records include `projectId` unless explicitly documented as tenant configuration or framework metadata.
- Relationships are explicit and traceable.
- Repository queries enforce tenant context.
- Database policies enforce tenant context.

## Service Criteria

- Services expose typed methods.
- Services do not leak persistence implementation details.
- Service methods require tenant/session context.
- Cross-module workflows are documented before implementation.

## UI Criteria

- The page has a clear operational purpose.
- The user has a next action.
- The screen works with demo or mock data until persistence is wired.
- Empty states include guidance, generated examples, or suggested actions.
- Text and layout are responsive and accessible.

## AI Criteria

When a module uses AI, every output includes:

- Reason
- Supporting data
- Confidence
- Framework reference where applicable
- Human approval state for material changes

## Reporting Criteria

Reports must be generated from graph records, not hand-curated UI text. Each report output must identify source records and freshness.

## Acceptance Review

A module is accepted only if:

- It satisfies its module-specific requirements.
- It satisfies these universal criteria.
- Validation passes.
- Open issues are documented.
