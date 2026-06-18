# CLAUDE.md — Zig Build Instructions

This file is read automatically by Claude Code at the start of every session in this
repository. It is the project's standing operating instructions. Read it in full before
writing or editing anything.

## What Zig is

Zig is an **AI-Native Governance Operating System**, not a compliance checklist tool, not
an audit tracker, and not a framework repository. It helps organizations and professionals
build governance programs, understand risk, implement controls, measure maturity, and
produce portfolio-ready governance artifacts — through AI guidance, framework intelligence,
governance scoring, and continuous recommendations.

Every capability in the product must satisfy this loop, with no dead ends:

```
Create → Analyze → Recommend → Act → Measure → Report
```

## How this repo is meant to be built

**Documentation is the source of truth. Implementation follows documentation. Never
implement before documenting.** Before writing application code for a phase, the
corresponding docs in `docs/` must exist and be internally consistent. If a required
document is missing or thin, write or expand it first.

A project skill encoding this methodology lives at
`.claude/skills/zig-fable5-methodology/SKILL.md`. Consult it whenever you are deciding what
to build next, whether you're allowed to start coding, or which phase you're in.

### Current status of this repository

| Area | Status |
|---|---|
| `docs/vision/` | Written (product vision, positioning, success metrics) |
| `docs/product/` | PRD, personas, user journeys, MVP definition written. `information-architecture.md` still a stub. |
| `docs/architecture/` | Stub only — needs system architecture, multi-tenant model, AI architecture, framework engine, scoring engine, health advisor engine |
| `docs/modules/` | Stub only — one doc per module, see Required Modules below |
| `docs/frameworks/` | Stub only — universal governance model + one doc per supported framework |
| `docs/data/` | Stub only — entities, ERD, schema, relationship model |
| `docs/ux/` | `design-system.md` written. Navigation, wireframes, empty-states, dashboards still stubs |
| `docs/implementation/` | `roadmap.md` written. Sprint plan and per-Fable detail docs still stubs |
| `docs/qa/` | Stub only |
| `landing-page/` | Built — static marketing landing page |
| App code (`apps/web`, `apps/api`) | **Not started.** Do not start until Fable 1 documentation is complete and consistent (see below). |

Every stub file already states exactly what it must contain when filled in — open it,
fill it in, don't start from a blank page.

## Required documentation set

```
docs/
  vision/            product-vision.md, positioning.md, success-metrics.md
  architecture/       system-architecture.md, multi-tenant-architecture.md,
                       ai-architecture.md, framework-engine.md,
                       governance-scoring-engine.md, health-advisor-engine.md
  product/            prd.md, personas.md, user-journeys.md,
                       information-architecture.md, mvp-definition.md
  modules/             mission-control.md, project-builder.md, scenarios.md, assets.md,
                       risks.md, controls.md, evidence.md, tasks.md, ai-command.md,
                       health-advisor.md, reporting.md
  frameworks/         universal-governance-model.md, iso27001.md, soc2.md,
                       nist-csf.md, cis-controls.md, hipaa.md, pci-dss.md
  data/               database-schema.md, erd.md, entities.md, relationships.md
  ux/                 design-system.md, navigation.md, wireframes.md,
                       empty-states.md, dashboards.md
  implementation/     roadmap.md, sprint-plan.md, fable-1.md ... fable-5.md
  qa/                 acceptance-criteria.md, test-plan.md, e2e-validation.md
```

## Product surface — modules (and only these)

1. Mission Control
2. Guided Project Builder
3. Scenario Workspace
4. Asset Workspace
5. Risk Workspace
6. Control Workspace
7. Evidence Workspace
8. Task Workspace
9. AI Command Center
10. Health Advisor
11. Executive Reporting

Do not add additional modules unless a clear gap is documented and justified in
`docs/product/prd.md` first.

## The Universal Governance Model

Every entity in the product connects along this chain — no orphans, no isolated modules:

```
Organization → Project → Asset → Risk → Control → Framework Requirement → Evidence → Task → Report
```

## Multi-tenant model

Every record belongs to an Organization and a Project. Tenant isolation is mandatory and
must be enforced at the data layer, not just in the UI. Roles: Organization Admin, GRC
Manager, Risk Analyst, Compliance Analyst, Auditor, Consultant, Viewer. Consultants may
manage multiple organizations.

## Framework intelligence

Frameworks (ISO 27001, SOC 2, NIST CSF, CIS Controls, HIPAA, PCI DSS) are **metadata**, not
separate modules. Assets, risks, controls, evidence, tasks, and reports must all be
framework-aware — never hardcode framework-specific logic into a module.

## Governance scoring & Health Advisor

The governance score must be explainable: every score states why it exists, what affects
it, and how to improve it. Inputs: asset/risk/control/framework coverage, evidence
completeness, ownership completeness, review completion. The Health Advisor continuously
surfaces gaps (missing assets, risks, controls, evidence, owners, reviews, framework gaps),
and every recommendation it makes needs a severity, an explanation, an action, and ideally a
one-click remediation.

## AI Command Center

Not a chatbot — an AI governance operator. It generates programs, risks, controls,
framework mappings, gap analyses, readiness assessments, reports, and scenarios. Every
AI recommendation must carry a reason, supporting data, a confidence level, and framework
references (see the explainability model in `docs/architecture/ai-architecture.md`).

## Zero empty states

No screen should ever be blank. Every screen needs demo data, an AI-generation entry point,
suggested actions, example records, or a clear next step.

## Build sequence — Fable 1 through 5

Build in this order. Do not start a Fable phase until the previous one's documentation and
implementation are both complete.

1. **Fable 1 — Foundation**: auth, organizations, projects, RBAC, multi-tenant architecture,
   navigation, design system, demo data. Outcome: signup → org → project → dashboard works.
2. **Fable 2 — Core Governance**: Mission Control, Assets, Risks, Controls, Evidence, Tasks.
   Outcome: Asset → Risk → Control → Evidence → Task is fully operational.
3. **Fable 3 — Framework Intelligence**: framework engine, mappings, coverage engine,
   readiness engine. Outcome: a framework-aware platform.
4. **Fable 4 — AI Governance OS**: AI program/risk/control generators, AI governance coach,
   Health Advisor. Outcome: AI can generate a complete governance program end to end.
5. **Fable 5 — Production Readiness**: scenario engine, portfolio artifacts, executive
   reporting, performance, security, accessibility, E2E validation. Outcome: complete MVP.

The full end-to-end journey that must work by the end of Fable 5, in under 20 minutes for a
new user:

```
Signup → Create Organization → Create Project → Generate Governance Program →
Review Assets → Review Risks → Review Controls → Upload Evidence →
Receive Recommendations → Improve Governance Score → View Readiness →
Generate Executive Report
```

## Hard rules — never violate these

- Never implement before documenting.
- Never hardcode framework-specific logic into a module — frameworks are metadata.
- Never break tenant isolation.
- Never create a disconnected workflow or an orphaned entity outside the Universal
  Governance Model.
- Never ship a screen with a blank/empty state.
- Every AI recommendation must be explainable (reason, data, confidence, framework
  reference).
- Success is measured by governance outcomes (does the user's journey work end to end),
  not by feature count or file count.

## Planned repo layout for application code (not yet created)

```
apps/web/        Next.js frontend
apps/api/        API layer
src/components/  src/features/  src/lib/  src/hooks/  src/types/
supabase/migrations/
docs/            (this documentation OS)
```
