---
name: zig-fable5-methodology
description: Use this skill in any session working inside the Zig governance OS repository — when generating or updating anything under docs/, when deciding what to build next, before writing any application code, when planning a sprint, or when implementing any part of Mission Control, Assets, Risks, Controls, Evidence, Tasks, the Framework Engine, the Governance Scoring Engine, the Health Advisor, or the AI Command Center. This is the project's standing build methodology (Documentation-OS-first, then five ordered "Fable" phases) and overrides any instinct to jump straight to code. Consult it before starting new work, before skipping ahead to a later phase, and whenever unsure which document or module is missing.
---

# Zig: Documentation-OS + Fable-5 Methodology

Zig is built with documentation as the source of truth, executed through five ordered
phases ("Fables"). This skill tells you how to decide what to do next in this repo and
what rules to enforce while doing it. The canonical project context lives in `CLAUDE.md`
at the repo root — read that first if you haven't already this session.

## The one rule that governs everything else

**Never implement before documenting.** If you're about to write application code and the
relevant doc in `docs/` is missing or is still a stub, stop and write the doc first, then
implement. This is not bureaucracy for its own sake — it's how a 40+ document, multi-module
product stays internally consistent instead of becoming 200 disconnected files.

## Next-action algorithm

Run this whenever you're unsure what to do next:

1. **Find the current Fable.** Check `docs/implementation/roadmap.md` and the status table
   in `CLAUDE.md` to see which Fable phase is active.
2. **Check that phase's required docs.** Walk the doc tree for the folders relevant to that
   phase (see mapping below). If any required file is missing or still a stub (look for the
   `> STATUS: STUB` marker at the top of a file), generate it before doing anything else.
   Write real content — entity lists, actual schema, actual scoring formulas — not more
   scaffolding.
3. **Check consistency, not just presence.** A filled-in doc that contradicts the Universal
   Governance Model, breaks tenant isolation, or invents a module outside the canonical 11
   is not done — it needs to be fixed before moving on.
4. **Only once docs for the phase are complete and consistent, implement.** Build the
   feature, then validate it against `docs/qa/acceptance-criteria.md` for that area before
   considering it finished.
5. **Update docs if implementation reveals a gap.** If building something surfaces a design
   decision the docs didn't cover, write it back into the doc before moving on — don't let
   the docs drift out of sync with reality.

## Fable phases → doc folders

| Fable | Builds | Primarily reads/writes |
|---|---|---|
| 1 — Foundation | auth, orgs, projects, RBAC, multi-tenant arch, nav, design system, demo data | `docs/architecture/multi-tenant-architecture.md`, `docs/ux/`, `docs/data/` |
| 2 — Core Governance | Mission Control, Assets, Risks, Controls, Evidence, Tasks | `docs/modules/`, `docs/data/`, `docs/architecture/governance-scoring-engine.md` |
| 3 — Framework Intelligence | framework engine, mappings, coverage, readiness | `docs/frameworks/`, `docs/architecture/framework-engine.md` |
| 4 — AI Governance OS | AI generators, coach, Health Advisor | `docs/architecture/ai-architecture.md`, `docs/architecture/health-advisor-engine.md` |
| 5 — Production Readiness | scenarios, portfolio artifacts, reporting, perf, security, a11y, E2E | `docs/implementation/`, `docs/qa/` |

Do not start a phase's implementation until its docs are complete *and* the prior phase's
implementation works end to end.

## Non-negotiable product invariants

Check every new doc and every piece of code against these before calling anything done:

- **Universal Governance Model**: `Organization → Project → Asset → Risk → Control →
  Framework Requirement → Evidence → Task → Report`. No orphan entities, no module that
  sits outside this chain.
- **Exactly 11 modules**: Mission Control, Project Builder, Scenario Workspace, Asset
  Workspace, Risk Workspace, Control Workspace, Evidence Workspace, Task Workspace, AI
  Command Center, Health Advisor, Executive Reporting. A 12th module needs a documented
  justification in `docs/product/prd.md` before it's built.
- **Frameworks are metadata, not modules.** ISO 27001 / SOC 2 / NIST CSF / CIS / HIPAA /
  PCI DSS attach to assets, risks, controls, evidence, tasks, and reports as tags and
  mappings — never as a separate hardcoded code path per framework.
- **Tenant isolation is mandatory** and enforced at the data layer (e.g. row-level security
  keyed on organization/project), not just hidden in the UI.
- **Explainable AI only.** Every AI-generated recommendation needs a reason, the supporting
  data it used, a confidence level, and a framework reference where relevant.
- **Explainable scoring only.** Every governance score must be able to say why it is what
  it is and what would improve it — never a black-box number.
- **Zero empty states.** No screen ships without demo data, an AI-generation entry point,
  suggested actions, or a clear next step.
- **The lifecycle loop applies everywhere**: Create → Analyze → Recommend → Act → Measure →
  Report. A feature that dead-ends without feeding the next step in this loop is incomplete.

## Writing stub vs. real docs

When you create a placeholder for a not-yet-written doc, start it with:

```
> STATUS: STUB — see CLAUDE.md and this skill for what's required here.
```

followed by a bullet list of exactly what the finished doc must contain (pulled from the
spec in `CLAUDE.md`). That's enough for a future session (or a future you) to pick it up
without re-deriving the requirements. Never leave a doc file fully blank.

When you write the real version, replace the stub marker and write production-grade
content: actual entity names and field types in `docs/data/`, an actual scoring formula
with weights in `docs/architecture/governance-scoring-engine.md`, actual screen-by-screen
flows in `docs/product/user-journeys.md` — not another layer of headers and bullet points
describing what should go there.

## Definition of done for a Fable phase

A phase is done only when:

1. Every doc listed for that phase in the table above exists and has no `STATUS: STUB`
   marker left in it.
2. The phase's "Expected Outcome" (see `CLAUDE.md`) actually works as a real, clickable
   end-to-end flow — not partially, not behind a flag, not stubbed-out in the UI.
3. The relevant section of `docs/qa/acceptance-criteria.md` is filled in and passes.
4. Nothing built in the phase violates the invariants list above.

If any of these isn't true, the phase is not complete — keep working it, don't move on to
the next Fable.
