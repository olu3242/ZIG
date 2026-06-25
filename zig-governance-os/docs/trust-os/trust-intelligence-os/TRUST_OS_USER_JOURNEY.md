# Trust OS User Journey (Batch 60)

STATUS: Design document. Documentation only. No code, migrations, or routes. Companion to
`TRUST_OS_MATURITY_PLATFORM.md`.

## Purpose

Narrates the 10-stage maturity journey from a single organization's point of view, one
stage at a time, naming which sub-system the org interacts with and what "done" looks
like at each stage. This document does not introduce new systems — every stage references
a system already named in `TRUST_OS_MATURITY_PLATFORM.md`.

## The journey

### 1. Learn
The org's GRC team is new to a framework (say, SOC 2) or to Zig itself. They use
**Learning OS** to build baseline knowledge of the framework and the platform. *Today:*
this is an aspirational stage — `learning-os` is a stub with no content delivery.

### 2. Assess
The org runs a baseline self-assessment to understand current posture. **Assessment
OS / Questionnaire OS** captures this. *Today:* `assessment-os`/`assessment-engine` are
thin stubs; `questionnaire-os` docs are empty — this stage has no working implementation.

### 3. Implement
The org builds out its actual governance program: assets, risks, controls, ownership.
**The governance engine** (Asset → Risk → Control chain per CLAUDE.md's Universal
Governance Model) is the real, working part of this stage —
`GovernanceScoreEngine` computes a defensible score from controls/evidence/risk-treatment/
assessment-completion inputs today.

### 4. Evidence
The org uploads and maintains evidence for each control. **Evidence OS**, scored by
**Evidence Health Score** (PR #9), tracks evidence through its lifecycle (Created →
Collected → Reviewed → Approved → Mapped → Used → Monitored → Expired → Archived).
*Today:* `autonomous-evidence`'s freshness-state logic is real; the rest of Evidence OS
is a stub.

### 5. Trust
The org is ready to present its posture externally — to customers, auditors, partners.
**Trust Center** (PR #10) is the customer-facing surface for this. *Today:* fully
designed (12 docs), zero application code.

### 6. Govern
The org operationalizes ongoing governance: review cycles, ownership accountability,
gap remediation. **The governance engine plus Health Advisor** serve this stage.
*Today:* the engine is real; the Health Advisor itself is an undocumented stub
(`docs/architecture/health-advisor-engine.md`).

### 7. Monitor
The org needs continuous, not point-in-time, assurance that the program stays correct.
**Continuous Assurance Engine** (Batch 54) serves this stage, watching Evidence,
Controls, Vendors, Policies, AI Assets, and Assessments for drift, failures, expired
items, and coverage gaps. *Today:* design-only; reuses real evidence-freshness logic for
the Evidence dimension, Build target for the rest.

### 8. Predict
The org wants to know what's coming before it becomes a finding — which evidence will
expire, which controls are likely to fail their next test, which vendors are trending
toward a risk escalation. **Predictive Trust Risk** (Batch 55) serves this stage.
*Today:* design-only, explicitly rules-based (no ML infrastructure exists in this repo).

### 9. Optimize
The org wants to know what to do next, ranked by impact, not just what's wrong.
**Recommendation Engine** (Batch 56) serves this stage, converting Continuous Assurance
findings and Predictive Risk scores into a ranked action list with named impact.
*Today:* design-only; classified Build since no unified recommendation system exists.

### 10. Certify
The org's sustained Trust Score and maturity level earn it a Trust Certification level
(Bronze through Continuous Trust). **Trust Certification Engine** (Batch 58) serves this
stage, tied to the Trust Maturity Model (PR #7), explicitly disambiguated from the
existing learner-level `certification-journeys`/`certification-readiness` packages, which
certify individuals, not organizations. *Today:* design-only.

## What "done" looks like, end to end

An organization that has gone through all 10 stages can: explain its governance program
from first principles (Learn/Assess), show real controls and evidence mapped to a
framework (Implement/Evidence), present that posture externally with confidence
(Trust), operate it continuously rather than re-assessing from scratch each audit cycle
(Govern/Monitor), see what's coming before it becomes a finding (Predict), know exactly
what to do next and why (Optimize), and hold an externally legible, maturity-tied
certification that means something because it's tied to a real, explainable score
(Certify) — rather than a marketing badge.

## Honest gap statement

As of this batch, stages 1, 2, 6 (partially), 7, 8, 9, and 10 have no corresponding
application code — only design documents (several written in this very batch). Stages 3,
4 (partially), and 5 have either real working code or substantial prior design investment.
This journey describes the destination CLAUDE.md's Fable phases are meant to build toward,
not the platform's current state.
