# Visual Asset Health Report

Scope: any dedicated visual-asset, diagram, image, or chart-registry subsystem
referenced by product/curriculum documentation — checked against the actual codebase
structure (`packages/*`, `apps/web/app/**`).

## Finding: this subsystem does not exist in the codebase as a discrete entity

This audit searched for a dedicated visual-asset or diagram-registry package using
multiple strategies:

1. `find packages -maxdepth 1 -type d` enumerated all ~110 packages in the monorepo
   (`packages/agents`, `packages/ai`, `packages/learning-os`, `packages/digital-twin`,
   `packages/skills-graph`, `packages/knowledge-graph`, etc.) — none is named or scoped
   around visual assets, diagrams, images, or charts (e.g. no `packages/visual-assets`,
   `packages/diagrams`, `packages/charts`).
2. A grep for "diagram", "workflow", "heatmap", "decision-tree", "framework-map",
   "org-chart" across `docs/`, `packages/`, and `apps/web/app/` found matches only in: (a)
   the literal route name `/risk/heatmap` (`apps/web/app/risk/heatmap/page.tsx`, 42 lines,
   confirmed read in full — a fully `mvp-data.ts`-backed static page with no crash risk
   and no actual heatmap-rendering library, just `StatCard`/`DataTable` components
   describing risk scores in prose/table form, not a visual heatmap grid); (b) prose
   references inside agent-workflow documentation (`docs/agents/ZIG_AGENT_WORKFLOW_MAP.md`,
   `docs/agents/ZIG_AGENT_GAP_REPORT.md`) describing workflows narratively, not as
   renderable diagram assets; and (c) `docs/certification/*.md` files describing "risk
   heatmap" and "framework mapping" as UI *features* (i.e. screens with data), not as
   visual-asset files or an asset-reference registry.
3. No image, SVG, or diagram file format (`.svg`, `.png` used for diagrams rather than
   icons/logos, `.drawio`, `.mermaid`) was found referenced from any `page.tsx` or
   service file in a way that suggests a managed visual-asset pipeline.

## Conclusion

"Visual asset health" as a discrete subsystem — something with its own package, table,
or asset-reference registry that this report could audit for broken links, missing
files, or stale references — does not exist in this codebase. What exists instead is:

- `/risk/heatmap`: a route *name* implying a visual heatmap, but implemented as ordinary
  `StatCard` and `DataTable` components over static risk-score data (no grid/color-coded
  visualization library or asset file involved).
- `apps/web/app/framework-mapper/page.tsx`: the "Control Crosswalk" feature, also
  text/table-based (`DataTable` with columns "ISO 27001", "SOC 2", "NIST CSF",
  "Coverage", "Status"), not a visual diagram.
- Scattered documentation *prose* in `docs/agents/` and `docs/certification/` describing
  these features narratively, with no accompanying asset files to audit.

This should be read as an explicit absence rather than a clean bill of health: if the
product roadmap (per curriculum/certification docs) intends these features to eventually
render as actual visual diagrams or color-coded heatmaps rather than tables, that
visual-rendering layer has not been started, and there is nothing yet to audit for
integrity, broken references, or staleness.

## Severity Table

| Finding | Severity |
|---|---|
| No visual-asset/diagram subsystem exists anywhere in the codebase | Informational (explicit absence) |
| `/risk/heatmap` and Control Crosswalk are table/text UI, not visual diagrams | Informational |

## Recommendation

No remediation is applicable to a subsystem that does not exist. If visual
heatmap/diagram rendering is a real product requirement, it should go through the
project's documentation-first methodology (per `CLAUDE.md`/the zig-fable5-methodology
skill) before any implementation — i.e., write the spec for what a "visual asset" is
(chart library choice, asset storage location, regeneration strategy) before adding code,
consistent with how this audit found every other subsystem in this repository to have
been built.
