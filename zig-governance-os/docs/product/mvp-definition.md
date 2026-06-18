# MVP Definition — Zig

## Definition of "MVP" for Zig

The MVP is complete when a new user can go from signup to a generated, reviewed,
evidence-backed, scored, and reported governance program — the full 12-step primary
journey in `docs/product/user-journeys.md` — in under 20 minutes, for at least one
supported framework, without hitting a blank screen or a dead-end workflow at any point.

## Included in MVP (Fable 1–5)

- Authentication, organizations, projects, RBAC, multi-tenant isolation (Fable 1)
- Mission Control, Asset/Risk/Control/Evidence/Task Workspaces, fully connected per the
  Universal Governance Model (Fable 2)
- Framework Engine with mappings, coverage, and readiness for at least ISO 27001, SOC 2,
  and NIST CSF at launch, with CIS Controls, HIPAA, and PCI DSS following the same engine
  (Fable 3)
- AI Program/Risk/Control Generators, AI Governance Coach, and a continuously running
  Health Advisor with explainable recommendations (Fable 4)
- Scenario Workspace (create/pause/resume/fork/clone), Portfolio Artifacts, Executive
  Reporting, and baseline performance/security/accessibility hardening plus end-to-end
  validation (Fable 5)
- Three fully populated demo environments (SaaS Startup, Fintech Startup, Healthcare
  Organization) so no new user or evaluator ever faces an empty product
- An explainable governance score visible at the project level at all times

## Explicitly excluded from MVP

- Custom/user-authored framework definitions beyond the six supported frameworks (ISO
  27001, SOC 2, NIST CSF, CIS Controls, HIPAA, PCI DSS)
- Native integrations with external evidence sources (cloud provider APIs, ticketing
  systems, identity providers) — evidence is uploaded directly in MVP
- White-labeling / multi-brand support for consultants' clients
- Granular field-level permission overrides beyond the seven defined roles
- A public API for third-party integrations
- Native mobile apps (responsive web only for MVP)

## Success metrics for MVP sign-off

See `docs/vision/success-metrics.md` in full; the binding sign-off criteria are:

1. The 12-step primary journey completes end to end, for a new account, in under 20
   minutes, with zero blank screens encountered.
2. All three demo environments are fully populated with assets, risks, controls, evidence,
   tasks, and at least one generated report each.
3. Every Health Advisor recommendation in the demo environments carries a severity,
   explanation, action, and (where applicable) a one-click remediation.
4. Every AI-generated record (program, risk, control, mapping) carries a reason,
   supporting data reference, and confidence level.
5. `docs/qa/acceptance-criteria.md` and `docs/qa/e2e-validation.md` are both fully filled
   in and passing for all 11 modules.
