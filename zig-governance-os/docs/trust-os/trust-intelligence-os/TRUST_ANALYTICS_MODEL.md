# Trust Analytics Engine (Batch 52)

STATUS: Design document. Documentation only. No code, migrations, or routes.

## Purpose

The Trust Analytics Engine is Zig's **internal, program-wide trend layer**: it takes the
point-in-time outputs of existing scoring systems and tracks them over time, across six
metrics, for a single tenant's governance program.

## Naming disambiguation (read before assuming overlap)

This is explicitly **not** the same thing as any Trust Center *portal usage* analytics
that PR #10's Trust Center OS reconciliation may introduce (e.g. customer/auditor view
counts, document download counts, portal session analytics for the customer-facing
`/trust` surface). That would be **external-facing portal usage analytics** — how
visitors use the Trust Center.

The Trust Analytics Engine described here is **internal-facing program analytics** — how
an organization's own trust posture is trending over time, visible to the org's own GRC
team, not to external visitors. If both systems exist, they should be named distinctly in
any shared UI (e.g. "Trust Center Usage Analytics" vs. "Trust Program Analytics") and
should not be merged without an explicit reconciliation doc.

## The six trend metrics

1. **Trust Score Trends** — time series of the PR #7 Trust Score (Governance
   15/Risk 15/Controls 20/Evidence 20/Audit 10/Vendors 10/AI Governance 10 = 100) and its
   seven component sub-scores, sampled at a regular cadence (e.g. daily snapshot,
   weekly/monthly rollup for display).
2. **Evidence Health Trends** — time series of the PR #9 Evidence Health Score
   (Freshness 30/Review Status 25/Usage 15/Coverage 15/Mapping 15), and the count of
   evidence items at each lifecycle stage (Created → Collected → Reviewed → Approved →
   Mapped → Used → Monitored → Expired → Archived) over time.
3. **Framework Readiness** — time series of per-framework coverage/readiness percentage,
   sourced from `framework-engine`'s mapping output, tracked per framework
   (ISO 27001, SOC 2, NIST CSF, CIS Controls, HIPAA, PCI DSS) rather than as a single
   blended number.
4. **Vendor Assurance Trends** — time series of vendor risk tier distribution and vendor
   assessment completion rate. (No dedicated Vendor OS package exists today per the
   Batch 51 audit; this metric is defined now so the Continuous Assurance and
   Predictive Risk batches have a place to plug in vendor data once it exists, rather
   than inventing vendor scoring logic itself.)
5. **AI Governance Trends** — time series of the AI Trust Score (batches 41-50:
   Inventory 10/Governance 20/Controls 20/Monitoring 15/Evidence 15/Oversight 10/
   Assessments 10 = 100) and its component trend.
6. **Questionnaire Performance** — time series of questionnaire/assessment completion
   rate, average response quality/confidence (per PR #8's Confidence Score where
   responses cite evidence), and turnaround time. No dedicated Questionnaire OS package
   exists today (confirmed empty in the Batch 51 audit); this metric defines the shape
   of data Trust Analytics expects once Questionnaire OS exists, without building it.

## Design principles

- **No new scoring formulas.** This engine consumes existing scores (Trust Score,
  Evidence Health Score, AI Trust Score, Confidence Score) as time-series inputs. It does
  not compute a new score.
- **Snapshot-based, not live-recompute.** Trend data requires periodic snapshots of each
  score (e.g. a `trust_score_snapshots`-shaped table, not built in this batch) rather than
  recomputing historical scores retroactively.
- **Explainable trend, not just a sparkline.** Every trend should be presentable with a
  plain-language delta statement (e.g. "Evidence Health Score improved 6 points over 30
  days, driven by Freshness"), consistent with the explainability requirement in
  CLAUDE.md's Governance Scoring section.
- **Multi-tenant by construction.** All six metrics are scoped to `tenant_id` /
  `project_id`, per the Universal Governance Model's mandatory tenant isolation. No
  cross-tenant aggregation happens in this engine — that is Batch 53's explicit, separate
  concern.

## Relationship to other batches

- Feeds Batch 53 (Benchmarking) with the org's own time series, which benchmarking then
  positions against anonymized peer aggregates.
- Feeds Batch 55 (Predictive Trust Risk) with trend slopes as a leading-indicator input
  (e.g. a declining Evidence Health trend raises Evidence Expiration Risk).
- Feeds Batch 57 (Executive Intelligence) with the trend narratives used in board reports
  and briefings.
