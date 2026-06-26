# Executive Intelligence (Batch 57)

STATUS: Design document. Documentation only. No code, migrations, or routes.

## What the existing executive surfaces actually render today

Before claiming any reuse, the Batch 51 audit read the current source of both candidate
surfaces:

- **`apps/web/app/executive-assurance/page.tsx`** — a real, tenant-gated
  (`requireTenantContext()`) React page rendering 4 `StatCard`s and 1 `DataTable`. It
  uses `ComplianceNetwork` (whose output is template-string "signals" like
  `"benchmark:financial_services"` — text, not computed data) and
  `ExecutiveDigitalTwin` (whose `forecast()` is current score plus a fixed constant per
  horizon, and whose "gap" is a plain subtraction). All inputs, including
  `currentScore: 76` and `targetScore: 92`, are hardcoded literals in the page file
  itself. There is no data fetch from Supabase on this page.
- **`apps/web/app/compliance-command-center/page.tsx`** — also tenant-gated, wires
  together nine differently-named "engine" packages (`AgentOperatingSystem`,
  `AutonomousAnalytics`, `AutonomousEvidenceEngine`, `AutonomousRiskEngine`,
  `AutonomousWorkflowOrchestrator`, `BoardReportingEngine`, `ContinuousComplianceEngine`,
  `CopilotRuntime`, `RegulatoryIntelligenceNetwork`). Every one of these is a 6-20 line
  class doing simple averaging, banding (red/amber/green thresholds at 50/75), or string
  concatenation over hardcoded literal inputs defined in the page itself (e.g.
  `frameworkReadiness: 82, controlHealth: 76`).

**Conclusion**: both pages have real, working React structure and real auth — but the
"intelligence" underneath is decorative arithmetic over hardcoded numbers, not a
connection to any live program data. This batch does not claim to reuse a working
reporting *data layer*, because none exists yet — only the page shells and the
acknowledgment that a `BoardReportingEngine`-named class already exists as a naming
precedent.

## What Executive Intelligence defines

This batch defines the **real aggregation contract** that, if/when these existing pages
(or new ones) are wired to live data, should supply them — replacing hardcoded literals
with actual Trust Intelligence output, without renaming or duplicating the existing
`BoardReportingEngine` concept.

## Outputs

1. **Board Reports** — a structured, periodic (e.g. quarterly) document combining Trust
   Score trend (Batch 52), Peer Trust Index (Batch 53), top Continuous Assurance findings
   (Batch 54), and top predicted risks (Batch 55) into board-appropriate narrative
   sections.
2. **Executive Briefings** — a shorter, more frequent (e.g. weekly/monthly) summary of
   the same underlying data, optimized for a single read-through rather than board
   presentation.
3. **Trust Status** — current Trust Score, band, and one-sentence "why" (reusing
   `GovernanceScoreEngine`-style explanation, applied to Trust Score per PR #7).
4. **AI Governance Status** — current AI Trust Score (batches 41-50, read-only
   reference) and trend, mirroring Trust Status's shape for the AI dimension.
5. **Top Risks** — the highest-scoring items from Predictive Trust Risk (Batch 55),
   ranked, with their driving signals shown (never a bare number).
6. **Top Opportunities** — the highest-impact items from the Recommendation Engine
   (Batch 56), i.e. the inverse framing: not "what's wrong" but "what, if fixed, moves
   the needle most."

## Design principle: no new scores

Executive Intelligence introduces no new scoring formula. It is purely an aggregation and
narrative layer over Trust Score (PR #7), Confidence Score (PR #8), Evidence Health Score
(PR #9), AI Trust Score (batches 41-50), Peer Trust Index (Batch 53), Continuous Assurance
findings (Batch 54), Predictive Trust Risk (Batch 55), and Recommendation Engine output
(Batch 56).

## Relationship to existing pages

This batch does not modify `executive-assurance/page.tsx` or
`compliance-command-center/page.tsx`. It documents the aggregation contract those pages
(or successors) should eventually consume in place of their current hardcoded literals.
Any future implementation work should explicitly reconcile naming with the existing
`BoardReportingEngine` and `ContinuousComplianceEngine` classes rather than introducing
parallel ones with different names for the same concept.
