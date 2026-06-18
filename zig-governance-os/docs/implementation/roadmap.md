# Roadmap — Zig

## Phase breakdown

Built in five ordered phases ("Fables"); each phase has a hard exit criterion before the
next begins (see Definition of Done in `.claude/skills/zig-fable5-methodology/SKILL.md`).

### Fable 1 — Foundation
Auth, organizations, projects, RBAC, multi-tenant architecture, navigation, design system
implementation, demo data loading. **Exit**: signup → org → project → dashboard works for
a real account, with the design system from `DESIGN.md` / `docs/ux/design-system.md`
actually implemented, not placeholder styling.

### Fable 2 — Core Governance
Mission Control, Asset/Risk/Control/Evidence/Task Workspaces, all wired to the Universal
Governance Model. **Exit**: a user can create an asset, link a risk to it, link a control
to the risk, attach evidence to the control, and see a task generated from a gap — all in
one connected chain, for a real (non-demo) record.

### Fable 3 — Framework Intelligence
Framework Engine, mappings, coverage engine, readiness engine, for at least ISO 27001,
SOC 2, and NIST CSF. **Exit**: every control created in Fable 2 shows real framework
coverage and a readiness percentage that changes when a mapping is added or evidence is
attached.

### Fable 4 — AI Governance OS
AI Program/Risk/Control Generators, AI Governance Coach, continuously running Health
Advisor. **Exit**: a brand-new project can go from empty to a full AI-generated starting
program (assets, risks, controls, framework mappings) with every generated record carrying
a reason, supporting data, and a confidence level; the Health Advisor is producing real,
actionable recommendations against that generated program.

### Fable 5 — Production Readiness
Scenario engine, portfolio artifacts, executive reporting, performance hardening, security
hardening, accessibility pass, full end-to-end validation. **Exit**: the full 12-step
primary user journey (`docs/product/user-journeys.md`) completes in under 20 minutes for a
new account, with zero empty states encountered, and `docs/qa/e2e-validation.md` signed
off.

## Dependency notes

- Fable 3's coverage/readiness numbers depend on Fable 2's controls and evidence existing
  — framework work cannot meaningfully start until the core governance chain is real.
- Fable 4's generators write directly into the Fable 2 data model — there is no separate
  "AI draft" table that gets merged in later. This is what keeps the AI Command Center
  from becoming a disconnected chatbot bolted onto the side of the product.
- Fable 5's Executive Reporting reads live from everything built in Fables 2–4; it should
  require no new data model, only new read/aggregation/export logic.

## Detailed sprint-level breakdown

Not yet written — see `docs/implementation/sprint-plan.md` (currently a stub) for the
10–20 sprint breakdown this roadmap should expand into, and the per-Fable detail docs
(`fable-1.md` through `fable-5.md`, also stubs) for sprint-level acceptance criteria per
phase.
