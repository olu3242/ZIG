# Learning Runtime: Career OS (Wave 9)

## Status today — read this before anything else
**This entire feature has no backing service, no data model, and no PRD justification
today.** `<CareerMode />` is a genuinely new concept relative to the existing 11 modules
listed in `CLAUDE.md` (Mission Control, Guided Project Builder, Scenario Workspace, Asset
Workspace, Risk Workspace, Control Workspace, Evidence Workspace, Task Workspace, AI Command
Center, Health Advisor, Executive Reporting). CLAUDE.md states plainly: "Do not add
additional modules unless a clear gap is documented and justified in `docs/product/prd.md`
first." That justification does not exist yet — `docs/product/prd.md` has not been checked
in this document for a CareerMode entry, and none of this repo's confirmed services
(`AssetService`, `AuditService`, `ControlService`, `EvidenceService`, `FrameworkService`,
`GovernanceService`, `LearningService`, `ProjectService`, `RiskService`, `ScenarioService`,
`TenantService`, `UserService`) models roles, daily-work simulation, promotions, or
performance reviews in any form.

**Everything below this point is a forward-looking conceptual design, explicitly labeled
pre-justification.** It exists so that *if* CareerMode is ever PRD-justified, the next
session has a starting design rather than a blank page — consistent with this repo's
"never implement before documenting" rule, which this document does not bypass: it
documents a *concept*, not an approved build. No code, service, or schema should be created
against this spec until the PRD justification CLAUDE.md requires is written and approved.

## Required precondition before any implementation
1. Write the CareerMode gap justification in `docs/product/prd.md` (or its successor),
   stating the clear product gap it fills relative to the 11 existing modules.
2. Get that justification approved/accepted as part of the module list (i.e. CLAUDE.md's
   module list would need to be amended to admit a 12th module, or CareerMode would need to
   be scoped as a sub-feature of an existing module rather than a new one).
3. Only then does a runtime/data-model decision (new `CareerService`? extension of
   `LearningService`? extension of `ProjectService`?) become appropriate to make.

This document does not perform step 1. It is downstream design content only, useful once
step 1-3 are satisfied.

## Conceptual scope (pre-justification)

### Roles
| Role | Concept |
|---|---|
| GRC Analyst | Entry-level governance/compliance work simulation |
| Compliance Officer | Mid-level — owns framework compliance posture for a simulated org |
| Auditor | Independent review simulation — challenges other roles' work product |
| Risk Manager | Owns risk register/treatment decisions for a simulated org |
| CISO | Executive-level — owns governance program strategy and reporting |

### Features
| Feature | Concept |
|---|---|
| Daily Work | A simulated task queue representing what that role would actually do day-to-day |
| Promotions | Progression from one role to the next based on accumulated competency |
| Performance Reviews | Periodic structured feedback simulating a real workplace review cycle |
| Skill Progression | Tracks which skills (see `LEARNING_RUNTIME_PORTFOLIO_RUNTIME.md`'s Skills section) a role's daily work has exercised |

## What "Daily Work" would conceptually simulate
Daily Work would generate a recurring queue of role-appropriate tasks drawn from the same
entity types the live product already has (risks, controls, evidence, audits, assets) but
scoped to a *simulated* tenant/project rather than the learner's real governance work. For
example:
- **GRC Analyst** daily work: "Review this asset's risk register — 2 risks are missing
  control mappings, flag them."
- **Auditor** daily work: "An evidence item was uploaded against Control C-114 — verify it
  satisfies the control's framework requirement."
- **CISO** daily work: "This week's governance score dropped 8 points — draft the executive
  explanation."

Each task would conceptually be backed by the same record shapes `RiskService`,
`ControlService`, `EvidenceService`, `AuditService`, and `AssetService` already expose — the
novelty is not new entity types, it is a *simulated, role-scoped task generator* sitting on
top of them, plus a role-progression/review layer that has no current analog anywhere in
this codebase.

## How role selection would gate content (conceptual)
```typescript
// Forward design only — not implemented, not backed by any service today.
interface CareerModeState {
  learnerId: string;
  currentRole: "GRC Analyst" | "Compliance Officer" | "Auditor" | "Risk Manager" | "CISO";
  roleHistory: Array<{ role: string; startedAt: string; promotedAt?: string }>;
  dailyWorkQueue: CareerTask[];
  performanceReviews: PerformanceReview[];
}

interface CareerTask {
  taskId: string;
  role: string;
  description: string;
  relatedEntity: { type: "Risk" | "Control" | "Evidence" | "Asset" | "Audit"; id: string };
  status: "pending" | "completed";
}

interface PerformanceReview {
  reviewId: string;
  periodStart: string;
  periodEnd: string;
  competencyScores: Record<string, number>; // skill tag -> score, same tags as Portfolio's Skills section
  promotionEligible: boolean;
}
```

Role selection would gate which `CareerTask` templates are eligible to enter the
`dailyWorkQueue` — e.g. a learner in "GRC Analyst" never sees CISO-tier executive-reporting
tasks until promoted. Promotion eligibility would conceptually be computed from accumulated
`PerformanceReview.competencyScores`, which in turn would draw from the same skill
derivation rule already defined in `LEARNING_RUNTIME_PORTFOLIO_RUNTIME.md` (Section 3,
Skills) — reusing that derivation rather than inventing a second one.

## UI shape (conceptual)

```typescript
// Forward design only.
interface CareerModeProps {
  learnerId: string;
  tenantId: string;
}
```

Conceptually: a role banner (current role + progress to next), a Daily Work task list (the
`dailyWorkQueue`), a Performance Review history panel, and a Skill Progression panel that
visually reuses `<PortfolioViewer />`'s Skills section rather than re-deriving skills a
second way.

## What this wave does NOT do
Does not implement `<CareerMode />`. Does not create any new service, table, or route. Does
not write or approve the PRD justification CLAUDE.md requires before a 12th module can be
added — that justification must be written in `docs/product/prd.md` (or successor) and
approved first, as an explicit, separate prerequisite step before any of the conceptual
design above is built. Does not amend CLAUDE.md's module list. Everything in this document
is pre-justification design content, not a build plan.
