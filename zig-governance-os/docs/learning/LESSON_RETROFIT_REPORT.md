# Lesson Retrofit Report

## Purpose
Reports the outcome of retrofitting all 40 lesson files with the visual-standard sections
required by `VISUAL_LEARNING_STANDARD.md`.

## Scope
40 lesson files across 8 tracks (5 each: governance, risk, compliance, audit, vendor_risk,
security_governance, bcm_dr, executive_leadership), plus `LESSON_TEMPLATE.md` updated as
the source of truth for the section structure.

## Sections added to every lesson
`## Required Diagram`, `## Required Workflow`, `## Required Table`, `## Required Visual
Exercise` — appended after the existing `## Visual Assets Required` section, verified by
grep count (4 new headings) across all 40 files.

## Coverage outcome
All 40/40 files have all 4 sections. Where no matching library entry existed for a
specific lesson's content, the section states "Not applicable — see X instead" rather than
inventing an asset, per instruction.

## Lessons with thin or no library-entry coverage (flagged, not yet resolved)
- `governance/01`, `governance/05` — no table-library entry for chain/score-decomposition
  content
- `compliance/03`, `compliance/04`, `compliance/05` — no diagram-library entries for
  mapping-rationale/gap-analysis/reporting content
- `audit/03` — no table-library entry for sampling methodology
- `vendor_risk/01`, `vendor_risk/02`, `vendor_risk/03` — no diagram/table entries beyond
  Vendor Lifecycle/Tier Matrix
- `security_governance/01`, `03`, `04`, `05` — no table-library entries for
  governance-vs-ops boundary, ownership-gap, posture metrics
- `bcm_dr/01`, `03`, `05` — no table-library entries for BCM/DR scope, RTO/RPO gap, DR test
  feedback
- `executive_leadership/01` through `05` — thinnest coverage track; only Governance
  Dashboard diagram and 2 Workflow Library entries available; no table-library entries
  exist for executive content at all

## Recommended follow-up (not actioned in this wave)
Add new table-library entries: Score Decomposition Table, Sampling Methodology Reference
Table, Ownership Gap Table, Reporting Cadence Matrix, Board Delivery Time-Allocation
Table. This would close the Executive Leadership track's gap entirely and most of the
others' partial gaps.

## What this wave does NOT do
Does not add the recommended new table-library entries. Does not change any lesson's
Objectives, Business Context, Scenario Mapping, Framework Mapping, Knowledge Check, or
Artifact Produced sections — only appends the 4 new visual-standard sections.
