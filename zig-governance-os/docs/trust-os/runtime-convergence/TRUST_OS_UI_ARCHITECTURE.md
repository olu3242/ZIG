# Trust OS UI Architecture (Batches 61-70 — Runtime Convergence)

STATUS: Design document. Documentation only. No route is created by this batch.

## 1. The unresolved question this document closes

PR #10's `TRUST_CENTER_OS_MVP.md` (Batch 31-40) IA tree note states explicitly: "Does
not resolve the open '12th module' question raised in PR #10's Trust Center IA (whether
Trust Intelligence is a tab inside Trust Center or a sibling top-level product surface)."
PR #11's `TRUST_INTELLIGENCE_AUDIT.md` (Batch 51) restates the same open question
verbatim in its "What this batch does not do" section. PR #12 (AI Governance OS) adds a
third candidate (`/trust/ai-governance`) without taking a position either. **No prior PR
resolves this. This document resolves it.**

## 2. The question, precisely stated

CLAUDE.md (`zig-governance-os/CLAUDE.md:73-88`) lists exactly 11 modules as "Product
surface — modules (and only these)": Mission Control, Guided Project Builder, Scenario
Workspace, Asset Workspace, Risk Workspace, Control Workspace, Evidence Workspace, Task
Workspace, AI Command Center, Health Advisor, Executive Reporting. It then states: "Do not
add additional modules unless a clear gap is documented and justified in
`docs/product/prd.md` first."

The question: is `/trust/*` (Trust Center OS + AI Governance OS dashboard + Trust
Intelligence dashboard, composed as one route tree) a **12th module** requiring that
justification, or is it a **cross-cutting layer** that sits over the existing 11 and does
not require amending the module list?

## 3. Resolution: `/trust/*` is a cross-cutting layer, not a 12th module

**Position taken by this document: `/trust/*` is a cross-cutting layer over the existing
11 modules, not a 12th module. CLAUDE.md's module list does not need to be amended, and no
new PRD justification entry is required for it as a module.**

### Justification, against CLAUDE.md's own definitions

1. **CLAUDE.md defines a module as a workspace an authenticated tenant user operates
   inside** (`docs/modules/` lists one doc per module — "mission-control.md,
   project-builder.md, scenarios.md, assets.md, risks.md, controls.md, evidence.md,
   tasks.md, ai-command.md, health-advisor.md, reporting.md"). Every one of the 11 is
   internal, tenant-authenticated, and operates on the tenant's own Asset->Risk->Control
   ->Framework Requirement->Evidence->Task chain. `/trust/*`, as designed across PRs #10,
   #11, #12, is fundamentally **externally-facing first** — its primary audience is an
   unauthenticated prospect, customer, or auditor (Trust Center OS's entire premise per
   PR #10's audit, Finding 1: "no public/external-facing trust surface exists anywhere").
   A module, by CLAUDE.md's own framing, is something a tenant user does work inside; a
   cross-cutting layer is something that *projects* the tenant's existing work outward (or,
   for the internal `/trust/ai-governance` and `/trust/intelligence` dashboards, projects
   it *upward* to executives) without being a new place where day-to-day governance work
   happens.

2. **Every entity `/trust/*` displays already belongs to one of the 11 modules' data — it
   creates none of its own primary entities.** `TRUST_OS_COMPONENT_MAP.md` (this batch)
   shows Security Overview projects the Governance Score (Health Advisor / Executive
   Reporting's data), Compliance Center projects Framework/Control Workspace data,
   Evidence Center projects Evidence Workspace data, AI Security Assistant projects
   Evidence + Control Workspace data through a chat interface, and even AI Governance
   OS's own AI Asset->Risk->Control->Evidence chain is explicitly modeled as a *mirror* of
   the existing Asset->Risk->Control->Evidence chain (per PR #12's audit, Finding 3,
   citing PR #7's Trust Knowledge Graph sketch), not a new entity family unrelated to the
   Universal Governance Model. CLAUDE.md's Universal Governance Model
   (`CLAUDE.md:90-96`) states "every entity in the product connects along this chain — no
   orphans" — `/trust/*` satisfies this precisely *because* it has no orphan entities of
   its own; everything it shows is a projection, with the few genuinely new entities
   (`AccessRequest`, `PublishedDocument`, `PublishedCertification`, `AssistantInteraction`)
   serving the projection/access-control layer itself, not a new governance-domain entity
   inside the chain.

3. **A 12th module would also have to satisfy CLAUDE.md's "zero empty states" and
   "Create -> Analyze -> Recommend -> Act -> Measure -> Report" loop as a tenant-operated
   workspace** (`CLAUDE.md:15-19, 127-130`). `/trust/*`'s external sections (Security
   Overview, Compliance Center, etc.) are read-only to their primary external audience by
   design — a prospect does not "create" or "act" inside Security Overview, they consume
   it. Forcing it into the module list would require either weakening this loop's
   definition for the first time, or fragmenting `/trust/*` into oddly-shaped pseudo-CRUD
   workspaces it was never designed to be. The cross-cutting-layer framing avoids this
   entirely: the loop still applies, just one level up — tenant users create/analyze/act
   inside the 11 modules, and `/trust/*` measures and reports that work outward (and, for
   the AI Governance OS and Trust Intelligence internal dashboards, reports it upward to
   the tenant's own executives) — consistent with the existing 11th module, Executive
   Reporting, already being a reporting-and-projection surface rather than a CRUD
   workspace, and `/trust/*` is best understood as Executive Reporting's externally-facing
   and AI-specific siblings, not a peer to Mission Control or Asset Workspace.

4. **Practical consequence of this resolution:** no entry needs to be added to
   CLAUDE.md's module list or to `docs/product/prd.md`'s module justification process for
   `/trust/*` as a whole. If a future implementation phase discovers a genuinely new
   *internal* governance entity that does not fit any of the 11 existing modules (not
   identified by any of the six prior PRs' audits), that would need its own justification
   independently — this resolution does not pre-clear unrelated future module proposals.

## 4. The composed route tree

```
/trust                              (Trust Center OS, PR #10 — external-facing root)
├── /                               Security Overview        (PR #10, Batch 33)
├── /compliance                     Compliance Center         (PR #10, Batch 34)
│   └── (certification badge wall — shared content with /trust/certifications below)
├── /documentation                  Documentation Center       (PR #10, Batch 35)
├── /evidence                       Evidence Center            (PR #10, Batch 36)
├── /assistant                      AI Security Assistant ("ZARA Trust") (PR #10, Batch 37)
├── /portal                         Customer Assurance Portal  (PR #10, Batch 38)
├── /privacy                        Privacy                    (PR #10 reconciliation — projected
│                                    from the same PublishedDocument model as /documentation)
├── /certifications                 Certifications              (PR #10 reconciliation — badge
│                                    wall, also surfaces Trust Certification Engine's
│                                    Bronze/Silver/Gold/Platinum/Continuous Trust levels,
│                                    PR #11 Batch 58)
├── /vendors                        Vendor Assurance             (PR #10 reconciliation —
│                                    SubprocessorDisclosure rollup)
├── /ai-governance                  AI Governance OS dashboard   (PR #12, Batch 50 — distinct
│                                    audience: internal tenant admins/executives reviewing
│                                    their OWN AI inventory and AI Trust Score, not an
│                                    external-prospect-facing section; gated behind
│                                    requireTenantContext(), unlike the sections above it)
└── /intelligence                   Trust Intelligence dashboard (PR #11, Batch 59-60 — same
                                     internal-only audience as /ai-governance: Trust Analytics,
                                     Predictive Trust Risk, Continuous Assurance,
                                     Recommendation Engine, Executive Intelligence)

(persistent, not a route): "Contact Trust Team"  — an entry point per PR #10's IA tree,
present on every /trust/* page, not a content section
```

### Resolving the internal/external split within one route prefix

`/trust/ai-governance` and `/trust/intelligence` are internal-only (tenant-authenticated,
`requireTenantContext()`-gated) while the other seven `/trust/*` children are
external-facing (unauthenticated-safe by design). This is not a contradiction requiring a
different URL prefix for the internal two — it mirrors the existing precedent already in
the codebase: `apps/web/app/executive-assurance/page.tsx` and
`apps/web/app/compliance-command-center/page.tsx` (PR #10's audit, Finding 2) are both
real, tenant-gated internal dashboards that happen to live at top-level routes alongside
fully public ones, with no shared layout or auth leakage between them. `/trust/*` should
follow Next.js App Router's route-group convention: `/trust/(public)/...` for the seven
external sections and `/trust/(internal)/ai-governance`, `/trust/(internal)/intelligence`
for the two internal ones, sharing the `/trust` URL prefix for branding/navigation
coherence (both are, after all, part of the same Trust OS product surface) while using
Next.js's parenthesized route groups to apply entirely separate layouts and auth gates —
this requires no application code in this batch, it is stated here as the structural
resolution a future implementation phase should follow.

## 5. Cross-reference to prior IA work

The 9-section public IA (Security Overview, Compliance Center, Documentation Center,
Evidence Center, AI Security Assistant, Customer Assurance Portal, Privacy,
Certifications, Vendor Assurance) is unchanged from PR #10's reconciliation pass — this
document does not re-derive it, only composes it with the two internal dashboards added by
PR #12 and PR #11 and resolves where each one's auth boundary sits in the route tree.
