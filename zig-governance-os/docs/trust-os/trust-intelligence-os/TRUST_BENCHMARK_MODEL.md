# Trust Benchmarking (Batch 53)

STATUS: Design document. Documentation only. No code, migrations, or routes.

## Purpose

Trust Benchmarking positions an organization's Trust Score (and related metrics) against
anonymized peer cohorts, producing statements like "Your Trust Score is in the 72nd
percentile for mid-market financial services organizations pursuing SOC 2."

## Benchmark dimensions

1. **Industry** — e.g. Financial Services, Healthcare, SaaS/Technology, Government.
2. **Org Size** — e.g. Startup (<50 employees), Mid-Market (50-1000), Enterprise (1000+).
3. **Frameworks** — which framework(s) an organization is pursuing (ISO 27001, SOC 2,
   NIST CSF, CIS Controls, HIPAA, PCI DSS) — benchmarks are computed per-framework-cohort,
   not just overall, since readiness expectations differ by framework.
4. **Maturity** — Trust Maturity Model level (0-5, per PR #7) — comparing a Level 2 org
   only to other Level 2 orgs avoids the distortion of comparing a brand-new program to a
   five-year-mature one.
5. **AI Adoption** — whether/how heavily an org uses AI systems in scope of governance
   (None / Limited / Moderate / Extensive), since AI Trust Score relevance and risk
   profile differ sharply by adoption level.

## Output: peer-percentile statements

Each benchmark produces a plain-language percentile statement per metric, e.g.:

- "Trust Score: 78 — 65th percentile among Mid-Market SaaS orgs pursuing SOC 2 at
  Maturity Level 2."
- "Evidence Health Score: 84 — 80th percentile among peers at the same maturity level."
- "AI Governance Score: 61 — 40th percentile among Moderate AI-adoption peers" (a result
  that should itself trigger a recommendation in Batch 56, not just sit on a dashboard).

Percentile statements always include the cohort definition inline, so a number is never
shown without the population it was computed against — consistent with the
explainability principle threaded through every Zig scoring system.

## The real tension: benchmarking needs cross-tenant data, RLS isolates by tenant

This is the central design problem for this batch, and it is stated honestly rather than
glossed over.

- Every governance record in Zig is tenant-isolated by `tenant_id` at the RLS layer
  (`supabase/migrations/`), per CLAUDE.md's hard rule: "Never break tenant isolation."
  No org can query another org's raw scores, evidence, or controls — and Trust
  Benchmarking must not become a backdoor around that.
- But a useful percentile requires comparing one org's score against a population of
  *other* orgs' scores in the same cohort. A single-tenant query can never produce a
  percentile on its own.

## Resolution: anonymized aggregate rollups, never raw cross-tenant reads

1. **No tenant ever reads another tenant's row-level data.** RLS continues to apply
   unchanged to all existing tables. Benchmarking does not add any RLS exception, view,
   or service-role bypass that exposes another tenant's raw scores, evidence, or
   identifying metadata.
2. **A separate, deliberately anonymized aggregate layer is the only thing benchmarking
   reads from.** This layer would store only: cohort key (industry × size-band ×
   framework × maturity-level × AI-adoption-band), a rolling statistical distribution
   (e.g. percentile buckets or a histogram of scores), and a minimum cohort size
   threshold (e.g. no percentile is shown for a cohort with fewer than N=10-20
   organizations, to prevent re-identification by elimination in small cohorts).
3. **Aggregation is a one-way write, never a tenant-to-tenant read.** Each tenant's score
   snapshot (from Batch 52) contributes anonymously to its cohort's distribution via a
   batch/scheduled aggregation process — not via any query path a tenant's own session
   can use to inspect another tenant's contribution.
4. **No raw score is ever attributable back to a single other org.** The aggregate layer
   stores only cohort statistics, never a list of (org, score) pairs visible to any
   tenant-scoped session.
5. **This is a deferred build decision, not resolved here.** This batch documents the
   *shape* of the resolution (anonymized aggregate rollups with minimum cohort sizes,
   one-way contribution, no raw cross-tenant reads) consistent with the "never break
   tenant isolation" hard rule. The actual aggregation pipeline, its schema, and its
   refresh cadence are implementation decisions for whichever Fable phase eventually
   builds this — not specified as code here.

## New metric introduced here (Build, not Reuse)

Benchmarking needs one genuinely new artifact that doesn't exist anywhere upstream: the
**Peer Trust Index** — the percentile rank itself (e.g. "65th percentile"), distinct from
the Trust Score it's derived from. This is a new, explicitly named metric:

- **Non-collision statement**: Peer Trust Index is not a replacement for, alternative to,
  or recomputation of Trust Score (PR #7), Confidence Score (PR #8), Evidence Health
  Score (PR #9), or AI Trust Score (batches 41-50). It is a *position*, not a *score* —
  always expressed relative to a stated cohort, never as a standalone absolute number.

## Relationship to other batches

- Consumes Trust Analytics (Batch 52) time series as its input.
- Feeds Executive Intelligence (Batch 57) for board-level "how do we compare to peers"
  framing.
- Feeds Trust Certification (Batch 58) only as context, never as a certification input
  itself — certification levels are tied to absolute Trust Score bands and Maturity
  Model levels, not relative peer position, so that certification can't be gamed by a
  weak cohort.
