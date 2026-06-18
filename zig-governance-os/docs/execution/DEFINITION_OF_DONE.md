# Definition Of Done

## Batch Done

A batch is done when:

- Required files and deliverables exist.
- Source documentation was reviewed and updated where necessary.
- Implementation matches the requested batch only.
- Code compiles under strict TypeScript.
- Relevant validation commands pass.
- Tenant isolation remains intact.
- Audit requirements are met where data changes occur.
- Implementation report is written.
- Open issues and future dependencies are listed.
- Batch checkpoint is committed.

## Feature Done

A feature is done when:

- It maps to PRD, architecture, domain model, and Governance Graph.
- It has typed contracts.
- It has repository/service access where persistence is involved.
- It has UI states for loading, error, populated, and guided empty states where applicable.
- It does not introduce cross-tenant leakage.
- It does not create orphan records.
- It has tests or validation appropriate to risk.

## Documentation Done

A document is done when:

- It is not a stub.
- It describes purpose, scope, constraints, acceptance criteria, and dependencies.
- It links or names related implementation surfaces.
- It can guide implementation without requiring guesswork.

## Database Done

Database work is done when:

- Migrations exist.
- Tenant isolation is encoded in schema and RLS.
- Relationships and indexes are defined.
- Audit logging strategy is included.
- Documentation is updated.
- Migration validation is run or blocker is documented.

## Not Done

Work is not done if:

- It only scaffolds files without meaningful contracts.
- It passes UI build but breaks package typechecks.
- It has no implementation report.
- It depends on future behavior without documenting that dependency.
- It bypasses tenant isolation.
- It adds a roadmap item as if it were implemented capability.
