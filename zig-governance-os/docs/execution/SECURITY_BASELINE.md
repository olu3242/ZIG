# Security Baseline

## Purpose

The security baseline defines the minimum controls every Zig batch must preserve.

## Tenant Isolation

- Every operational table must include `tenant_id`.
- Every repository method must require tenant context.
- Every query must enforce tenant isolation.
- RLS must be enabled for persisted tenant-scoped tables.
- Cross-tenant access is allowed only through explicitly documented platform-admin workflows.

## Authentication And Authorization

- Authentication must use approved identity providers once Batch 22 is implemented.
- Authorization must use RBAC and permission checks.
- Privileged operations require audit events.
- Sessions must carry tenant context.
- Role changes must be auditable.

## Data Protection

- No secrets in source code.
- No credentials in docs, reports, or implementation logs.
- Sensitive fields must be minimized.
- Evidence files require access control and audit trails once storage is implemented.

## Audit Logging

Track:

- Create
- Update
- Delete
- Approve
- Reject
- Assign
- Complete
- Generate
- Certify

Audit records must include tenant, actor, action, entity, timestamp, and state where applicable.

## AI Safety

- AI must not bypass RBAC.
- AI must not access cross-tenant context.
- AI outputs must include reason, confidence, and supporting data.
- Material AI changes require human approval.

## Release Blockers

The following block release:

- Cross-tenant data exposure
- Missing RLS for tenant tables
- Secrets committed to repo
- Privileged mutation without audit trail
- Unscoped AI context
